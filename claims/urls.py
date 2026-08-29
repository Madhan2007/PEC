from django.urls import path
from . import views

urlpatterns = [
    path("", views.claim_list, name="claim_list"),

    path("create/", views.create_claim, name="create_claim"),

    path(
        "<int:claim_id>/",
        views.claim_detail,
        name="claim_detail"
    ),

    path(
        "<int:claim_id>/upload/",
        views.upload_document,
        name="upload_document"
    ),

    path(
        "<int:claim_id>/submit/",
        views.submit_claim,
        name="submit_claim"
    ),

    path(
        "<int:claim_id>/process/",
        views.process_claim,
        name="process_claim"
    ),
    
    path(
        "api/external-claim/",
        views.external_claim_api,
        name="external_claim_api"
    ),
]