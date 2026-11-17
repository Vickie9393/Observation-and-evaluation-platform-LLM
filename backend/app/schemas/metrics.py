from pydantic import BaseModel
from typing import List, Optional

class DashboardMetrics(BaseModel):
    total_requests: int
    total_cost: float
    total_tokens: int
    average_latency: float
    error_rate: float
    p95_latency: float
    timeseries: List[dict] = []

class TimeseriesData(BaseModel):
    date: str
    value: float

class CostChartResponse(BaseModel):
    data: List[TimeseriesData]
