from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('patient', 'Patient / Policyholder'),
        ('hospital_staff', 'Hospital / Provider Staff'),
        ('doctor', 'Doctor / Medical Officer'),
        ('auditor', 'Claims Auditor / Reviewer'),
        ('admin', 'System Administrator'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default='patient'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True, null=True)
    license_id = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    @property
    def is_admin_or_auditor(self):
        return self.role in ('admin', 'auditor') or self.user.is_staff or self.user.is_superuser

    @property
    def is_provider(self):
        return self.role in ('doctor', 'hospital_staff')


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """Automatically ensure a UserProfile exists for every User."""
    if created:
        role = 'admin' if instance.is_superuser else 'patient'
        UserProfile.objects.create(user=instance, role=role)
    else:
        # Guarantee profile exists even for legacy users
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={'role': 'admin' if instance.is_superuser else 'patient'}
        )

