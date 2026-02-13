export const imageCar = [
    { pic: '/image/000032.jpg' },
    { pic: '/image/000095.jpg' },
    { pic: '/image/002788.jpg' },
];

export const result_mockdata = [
    {
        part: 'กันชนหน้า',
        damageLevel: 'ชนเบา'
    },
    {
        part: 'ประตู',
        damageLevel: 'ชนเบา'
    },
    {
        part: 'กันชนหลัง',
        damageLevel: 'ชนปานกลาง',
        cost: 5000.00
    },
    {
        part: 'ไฟหน้า',
        damageLevel: 'ชนหนัก',
        cost: 600.5
    }
]

export const serviceCenter = [
    {
        name: 'โตโยต้า กรุงไทย รามอินทรา กม.9',
        timework: {
            open: "08:00",
            close: "17:00"
        },
        address: '491 Ram Inthra Rd, Ram Inthra',
        lat: 13.832995353388737,
        lon: 100.66952610312308,
        phone: '025109999'
    },
    {
        name: 'โตโยต้า เค.มอเตอร์ส สาขารามอินทรา กม.14',
        timework: {
            open: "08:30",
            close: "14:00"
        },
        address: '76 Ram Inthra Rd, Khwaeng Min Buri',
        lat: 13.815188042160186,
        lon: 100.71450591328762,
        phone: '025180862'
    }
];

export const select_part = [
    { value: '', label: '-- เลือกอะไหล่ --', img: '/icon/car-part.png', className: 'w-6' },
    { value: 'front_bumper', label: 'กันชนหน้า', img: '/car_parts/front-bumper.png', className: 'w-8' },
    { value: 'rear_bumper', label: 'กันชนหลัง', img: '/car_parts/rear-bumper.png', className: 'w-7' },
    { value: 'grille', label: 'กระจังหน้า', img: '/car_parts/grille.png', className: 'w-7' },
    { value: 'mirror', label: 'กระจกมองข้าง', img: '/car_parts/mirror.png', className: 'w-6' },
    { value: 'headlight', label: 'ไฟหน้า', img: '/car_parts/headlight.png', className: 'w-6' },
    { value: 'taillight', label: 'ไฟท้าย', img: '/car_parts/taillight.png', className: 'w-5' },
    { value: 'door', label: 'ประตู', img: '/car_parts/door.png', className: 'w-5' },
]