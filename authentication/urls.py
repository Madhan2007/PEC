from django.urls import path
from . import views

urlpatterns = [
    # Web views
    path("", views.dashboard, name="home"),
    path("login/", views.login_user, name="login"),
    path("register/", views.register, name="register"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("logout/", views.logout_user, name="logout"),
]