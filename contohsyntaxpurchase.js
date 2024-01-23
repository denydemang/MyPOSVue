let items = [
  {
    name: 'Hape',
    qty: 1,
    price: 0,
    total: 0
  },
  {
    name: 'Kalkulator',
    qty: 1,
    price: 0,
    total: 0
  },
  {
    name: 'Headset',
    qty: 1,
    price: 0,
    total: 0
  },
  {
    name: 'Tas',
    qty: 1,
    price: 0,
    total: 0
  }
];

const newItem = {
  name: 'Laptop',
  qty: 2,
  price: 25,
  total: 0
};

function pushItem(data) {
  const isExist = items.some((item) => item.name === data.name);
  if (isExist) {
    const updatedItem = items.map((item) => {
      if (item.name === data.name) {
        return { ...item, qty: item.qty + data.qty, price: data.price };
      } else {
        return { ...item };
      }
    });

    items = [...updatedItem];
  } else {
    items.push(data);
  }
}
function sumTotalItem() {
  const updatedItem = items.map((item) => {
    return { ...item, total: item.qty * item.price };
  });
  items = [...updatedItem];
}

for (let i = 0; i <= 10; i++) {
  pushItem(newItem);
  sumTotalItem();
}
console.log(items);
