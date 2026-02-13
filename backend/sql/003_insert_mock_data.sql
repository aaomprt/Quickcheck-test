INSERT INTO
    users (
        line_id,
        first_name,
        last_name
    )
VALUES (
        'U1234567890',
        'Patcharaporn',
        'Phiwsuk'
    ),
    (
        'U0987654321',
        'Somchai',
        'Jaidee'
    );

INSERT INTO
    car (
        license_plate,
        chassis_number,
        user_id,
        brand,
        model,
        year,
        model_image,
        service_center_id
    )
VALUES (
        '1กข-1234',
        'JTNB11HK0K1234567',
        1,
        'Toyota',
        'Altis',
        2020,
        'https://example.com/images/corolla.png',
        1
    ),
    (
        '2ขค-5678',
        'MR053REZ0J6543210',
        2,
        'Toyota'
        'Camry',
        2019,
        'https://example.com/images/revo.png',
        2
    );

INSERT INTO
    part_master (
        part_number,
        part_type,
        model,
        year,
        price
    )
VALUES (
        'PB-FRONT-001',
        'front_bumper',
        'Corolla Altis',
        2020,
        8500.00
    ),
    (
        'PB-REAR-001',
        'rear_bumper',
        'Corolla Altis',
        2020,
        7800.00
    ),
    (
        'HD-LEFT-001',
        'headlight',
        'Hilux Revo',
        2019,
        12500.00
    ),
    (
        'DOOR-FR-001',
        'door',
        'Hilux Revo',
        2019,
        15000.00
    );

