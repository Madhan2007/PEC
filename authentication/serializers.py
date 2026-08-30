from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['role', 'role_display', 'phone_number', 'organization', 'license_id']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='patient', write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    organization = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number', 'organization']

    def create(self, validated_data):
        role = validated_data.pop('role', 'patient')
        phone_number = validated_data.pop('phone_number', '')
        organization = validated_data.pop('organization', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.phone_number = phone_number
        profile.organization = organization
        profile.save()

        user.refresh_from_db()
        return user
