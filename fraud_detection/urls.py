from django.urls import path
from . import views

urlpatterns = [
    # Web view
    path("radar/", views.fraud_radar_view, name="fraud_radar"),
]
