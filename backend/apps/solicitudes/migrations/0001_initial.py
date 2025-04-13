# Generated by Django 4.2.8 on 2025-04-12 16:55

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Solicitud',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200)),
                ('descripcion', models.TextField()),
                ('estado', models.CharField(choices=[('pendiente', 'Pendiente de Revisión'), ('aprobado_representante', 'Aprobado por Representante'), ('rechazado_representante', 'Rechazado por Representante'), ('en_inspeccion', 'En Inspección'), ('aprobado_social', 'Aprobado por Trabajo Social'), ('rechazado_social', 'Rechazado por Trabajo Social'), ('en_entrega', 'En Proceso de Entrega'), ('entregado', 'Entregado'), ('rechazado', 'Rechazado')], default='pendiente', max_length=30)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
                ('fecha_aprobacion_representante', models.DateTimeField(blank=True, null=True)),
                ('notas_internas', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Solicitud',
                'verbose_name_plural': 'Solicitudes',
                'ordering': ['-fecha_creacion'],
            },
        ),
    ]
