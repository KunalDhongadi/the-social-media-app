# Generated by Django 4.1.7 on 2023-04-19 10:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0007_alter_post_parent_post'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='styles',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
