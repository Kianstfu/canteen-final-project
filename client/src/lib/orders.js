// Ang API ay nagbabalik ng isang row kada item ng order. Dito natin sila
// pinagsasama-sama kada order_id (parehong logic ng orihinal na mga page).
// Sinasadya ang plain object (hindi Map): ang numeric keys ay naso-sort
// pataas, kaya pareho ang pagkakasunod-sunod ng orihinal.
export function groupOrders(rows) {
  const ordersMap = {};
  rows.forEach((row) => {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        customer_name: row.customer_name,
        building: row.building,
        room_number: row.room_number,
        total_amount: row.total_amount,
        status: row.status,
        date_placed: row.date_placed,
        followed_up: row.followed_up,
        rating: row.rating,
        notes: row.notes,
        items: []
      };
    }
    ordersMap[row.order_id].items.push({ name: row.item_name, qty: row.quantity });
  });
  return Object.values(ordersMap);
}

export const orderLabel = (id) => String(id).padStart(4, '0');
