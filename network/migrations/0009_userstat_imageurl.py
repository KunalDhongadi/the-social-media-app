# Generated by Django 4.1.7 on 2023-04-22 21:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_post_styles'),
    ]

    operations = [
        migrations.AddField(
            model_name='userstat',
            name='imageUrl',
            field=models.CharField(blank=True, max_length=256),
        ),
    ]
