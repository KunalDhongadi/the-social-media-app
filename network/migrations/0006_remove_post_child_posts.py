# Generated by Django 4.1.7 on 2023-04-18 22:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_post_child_posts_remove_post_parent_post_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='child_posts',
        ),
    ]