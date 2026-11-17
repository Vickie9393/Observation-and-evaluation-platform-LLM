from app.core.database import SessionLocal
from app.models.trace import Trace
from app.models.project import Project
from app.models.evaluation import Evaluation
from app.models.alert import Alert, AlertEvent
from app.evaluators.basic import evaluate_relevance, evaluate_groundedness

def evaluate_trace_task(trace_id: str):
    db = SessionLocal()
    try:
        trace = db.query(Trace).filter(Trace.id == trace_id).first()
        if not trace:
            return "Trace not found"

        project = db.query(Project).filter(Project.id == trace.project_id).first()
        if not project:
            return "Project not found"

        # Run evaluations
        results = []
        if project.eval_relevance_enabled:
            results.append(evaluate_relevance(trace.prompt, trace.response))
        if project.eval_groundedness_enabled:
            results.append(evaluate_groundedness(trace.prompt, trace.response))

        # Store evaluations
        for res in results:
            eval_record = Evaluation(
                trace_id=trace.id,
                evaluator=res["evaluator"],
                score=res["score"],
                reason=res["reason"],
                evaluator_version="1.0"
            )
            db.add(eval_record)
        
        # Process Alerts
        alerts = db.query(Alert).filter(Alert.project_id == project.id).all()
        for alert in alerts:
            triggered = False
            details = ""
            
            if alert.condition == "latency_greater_than" and trace.latency_ms > alert.threshold:
                triggered = True
                details = f"Trace latency {trace.latency_ms}ms exceeded threshold of {alert.threshold}ms."
            elif alert.condition == "cost_greater_than" and trace.cost > alert.threshold:
                triggered = True
                details = f"Trace cost ${trace.cost:.6f} exceeded threshold of ${alert.threshold:.6f}."
            elif alert.condition == "error_rate_greater_than":
                # Get last 50 traces for this project
                recent_traces = db.query(Trace).filter(Trace.project_id == project.id).order_by(Trace.timestamp.desc()).limit(50).all()
                if recent_traces:
                    error_count = sum(1 for t in recent_traces if t.status == "error")
                    error_rate = (error_count / len(recent_traces)) * 100
                    if error_rate > alert.threshold:
                        triggered = True
                        details = f"Error rate {error_rate:.1f}% exceeded threshold of {alert.threshold}%."
            
            if triggered:
                alert_event = AlertEvent(
                    alert_id=alert.id,
                    details=details
                )
                db.add(alert_event)
                
                if getattr(alert, 'webhook_url', None):
                    try:
                        import httpx
                        payload = {"text": f"🚨 MiniObserve Alert: {alert.name}\n{details}"}
                        httpx.post(alert.webhook_url, json=payload, timeout=5.0)
                    except Exception as e:
                        print(f"Failed to trigger webhook: {e}")

        db.commit()
        return f"Evaluated trace {trace_id} successfully."
    except Exception as e:
        db.rollback()
        print(f"Error in evaluate_trace_task: {e}")
    finally:
        db.close()
