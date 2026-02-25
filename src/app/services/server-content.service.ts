import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerContentService {

  private urlService = "http://localhost/api/";

  constructor(private http: HttpClient) { }

  // 🔥 Obtener sistema actual
  public getSystem(): string {
    return localStorage.getItem('system') || 'mecapos';
  }

  // ---------------- LOGIN ----------------

  LoginWithPassword(code: string, password: string, system: string) {
    let body = new FormData();
    body.append("code", code);
    body.append("password", password);
    body.append("system", system);

    return this.http.post(this.urlService + "login_user.php", body);
  }

  Login(code: string, floor: string) {
    let body = new FormData();
    body.append("code", code);
    body.append("user_type", floor);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "login.php", body);
  }

  Logout() {
    let body = new FormData();
    body.append("user_cash", localStorage.getItem("cash_id") || "");
    body.append("id_user", localStorage.getItem("id_user") || "");
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "logout.php", body);
  }

  // ---------------- PISOS Y MESAS ----------------

  getFlats() {
    let body = new FormData();
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_flats.php", body);
  }

  getTables(id_flat: string) {
    let body = new FormData();
    body.append("id_flat", id_flat);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_tables.php", body);
  }

  // ---------------- PRODUCTOS ----------------

  getCategories() {
    let body = new FormData();
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_categories.php", body);
  }

  getProductsByCategory(id_category: string) {
    let body = new FormData();
    body.append("id_category", id_category);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_products_by_category.php", body);
  }

  // ---------------- ÓRDENES ----------------

  createOrder(id_table: string, id_user: string, products: any[]) {
    let body = new FormData();
    body.append("id_table", id_table);
    body.append("id_user", id_user);
    body.append("products", JSON.stringify(products));
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "create_order.php", body);
  }

  updateOrderStatus(id_order: string, status: string) {
    let body = new FormData();
    body.append("id_order", id_order);
    body.append("status", status);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "update_order_status.php", body);
  }

  updateOrder(order_id: any, cart: any[]) {
    const formData = new FormData();
    formData.append('order_id', order_id);
    formData.append('products', JSON.stringify(cart));
    formData.append("system", this.getSystem());

    return this.http.post(`${this.urlService}update_order.php`, formData);
  }

  // ---------------- COCINA ----------------

  getKitchens() {
    let body = new FormData();
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_kitchens.php", body);
  }

  getKitchenOrders(kitchenId: any) {
    let body = new FormData();
    body.append("kitchen_id", kitchenId);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_kitchen_orders.php", body);
  }

  updateDetailStatus(detailId: number) {
    let body = new FormData();
    body.append("detail_id", detailId.toString());
    body.append("status", "ready");
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "update_detail_status.php", body);
  }

  deliverOrder(orderId: number) {
    let body = new FormData();
    body.append("order_id", orderId.toString());
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "deliver_order.php", body);
  }

  getOrderDetails(order_id: number) {
    let body = new FormData();
    body.append("order_id", order_id.toString());
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_order_details.php", body);
  }

  closeOrder(orderId: number) {
    let body = new FormData();
    body.append("order_id", orderId.toString());
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "close_order.php", body);
  }

  saveInvoiceData(orderId: number, nombre: string, nit: string) {
    let body = new FormData();
    body.append("order_id", orderId.toString());
    body.append("client_name", nombre);
    body.append("client_nit", nit);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "save_invoice_data.php", body);
  }

  // ---------------- REPORTES ----------------

  getAllOrders() {
    let body = new FormData();
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_all_orders.php", body);
  }

  getWaiters() {
    let body = new FormData();
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_waiters.php", body);
  }
getIngredients() {
  let body = new FormData();
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + "get_ingredients.php", body);
}

updateStock(data: any) {
  // Combinamos el ID y el STOCK con el SYSTEM actual
  const payload = {
    ...data,
    system: this.getSystem()
  };

  return this.http.post(this.urlService + 'update_stock.php', payload);
}
addAsset(asset: any) {
  // Combinamos el asset con el nombre del sistema
  const payload = { ...asset, system: this.getSystem() }; 
  return this.http.post(`${this.urlService}add_asset.php`, payload);
}

getAssets() {
  return this.http.get(`${this.urlService}get_assets.php?system=${this.getSystem()}`);
}
getProducts() {
  let body = new FormData();
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + "get_products.php", body);
}

addIngredient(data: any) {
  // Creamos un nuevo objeto que combina los datos del formulario + el sistema
  const payload = {
    ...data,
    system: this.getSystem()
  };

  // Enviamos 'payload' en lugar de 'data'
  return this.http.post('http://localhost/api/add_ingredient.php', payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}

updateIngredient(data: any) {
  // Combinamos los datos actuales con el nombre del sistema
  const payload = {
    ...data,
    system: this.getSystem()
  };

  return this.http.post('http://localhost/api/update_ingredient.php', payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}

getProductRecipe(id_product: number) {
  // Ajusta la ruta a tu archivo PHP (el que hace el JOIN de product_ingredient e ingredients)
  return this.http.get(`${this.urlService}/get_product_recipe.php?id_product=${id_product}`);
}

// 2. Guardar producto y receta (Todo junto)
saveFullProduct(payload: any) {
  // Este apunta al nuevo archivo PHP que te pasé anteriormente
  return this.http.post(`${this.urlService}/save_product.php`, payload);
}
getProductKitchens(id_product: number) {
  return this.http.get(`${this.urlService}get_product_kitchens.php?id_product=${id_product}`);
}
updateProductState(id: number, state: string) {
  const payload = {
    id_product: id,
    state: state,
    system: this.getSystem()
  };
  return this.http.post(`${this.urlService}update_product_state.php`, payload);
}
updateAssetFull(payload: any) {
  return this.http.post(`${this.urlService}update_asset_full.php`, payload);
}
updateAssetState(payload: any) {
  // payload ya contiene: { id_asset, estado, system }
  return this.http.post(`${this.urlService}update_asset_state.php`, payload);
}

getInformes(system: string) {
  return this.http.get(`${this.urlService}get_informes_resumen.php?system=${system}`);
}

















payOrder(orderId: any, method: string) {
  const formData = new FormData();
  formData.append("order_id", orderId);
  formData.append("payment_method", method);
  return this.http.post(
    this.urlService + "pay_order.php",
    formData
  );
}

//BRIEF------------------------
 LoadBrief () {
  return this.http.get(this.urlService + "brief.php");
 }
 LoadKitchens() {
  return this.http.get(this.urlService + "kitchen.php"); 
 }
 AddBrief (description:string) {
  let bodyLogin = new FormData();
  bodyLogin.append("id_user", localStorage.getItem("id_user") || "");
  bodyLogin.append("note", description);
  return this.http.post(this.urlService + "add_brief.php", bodyLogin);
 }
 AddBriefProduct (product:string, price:string, kitchen:string) {
  let bodyLogin = new FormData();
  bodyLogin.append("name", product);
  bodyLogin.append("price", price);
  bodyLogin.append("kitchen", kitchen);
  return this.http.post(this.urlService + "add_brief_product.php", bodyLogin);
 
 }
 DeleteBrief (id:string) {
  let bodyLogin = new FormData();
  bodyLogin.append("id", id);
  return this.http.post(this.urlService + "delete_brief.php", bodyLogin);
 }
 DeleteBriefProduct (id:string) {
  let bodyLogin = new FormData();
  bodyLogin.append("id", id);
  return this.http.post(this.urlService + "delete_brief_product.php", bodyLogin);
 }

//MESAS------------------------
  LoadZones () {
    return this.http.get(this.urlService + "zones.php");
  }
  LoadYourTables() {
    let bodyLogin = new FormData();
    bodyLogin.append("id_user", localStorage.getItem("user_id") || "");
    return this.http.post(this.urlService + "your_tables.php", bodyLogin);
  }
  LoadTables (zone:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("zone", zone);
    return this.http.post(this.urlService + "tables.php", bodyLogin);
  }
  LoadTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    return this.http.post(this.urlService + "detail_table.php", bodyLogin);
  }
  SwitchTable (oldTable:string, table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    bodyLogin.append("old_table", oldTable);
    return this.http.post(this.urlService + "switch_table.php", bodyLogin);
  }
  UpdateTableNotes (pid:string, notes:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    bodyLogin.append("notes", notes);
    return this.http.post(this.urlService + "table_notes.php", bodyLogin);
  }
  ClearTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    return this.http.post(this.urlService + "clear_table.php", bodyLogin);
  }
  CloseTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    return this.http.post(this.urlService + "close_table.php", bodyLogin);
  }
  OpenTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    return this.http.post(this.urlService + "open_table.php", bodyLogin);
  }
  UnassignTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    return this.http.post(this.urlService + "unassign_table.php", bodyLogin);
  }
  AssignTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    bodyLogin.append("id_user", localStorage.getItem("user_id") || "");
    return this.http.post(this.urlService + "assign_table.php", bodyLogin);
  }
  IsDeliveryTable (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("tid", table);
    return this.http.post(this.urlService + "is_delivery.php", bodyLogin);
  }
  LoadTableRecord (table:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    return this.http.post(this.urlService + "table_record.php", bodyLogin);
  }
  //PRODUCTOS------------------------
  LoadCategories (table:number) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table.toString());
    return this.http.post(this.urlService + "categories.php", bodyLogin);
  }
  LoadProducts (cat:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("category", cat);
    return this.http.post(this.urlService + "products.php", bodyLogin);
  }
  LoadProductDetail (pid:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    return this.http.post(this.urlService + "detail_product.php", bodyLogin);
  }
  UpdateProduct (pid:string, quantity:string, notes:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    bodyLogin.append("quantity", quantity);
    bodyLogin.append("notes", notes);
    return this.http.post(this.urlService + "update_product.php", bodyLogin);
  }
  DeleteProduct (pid:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    return this.http.post(this.urlService + "delete_product.php", bodyLogin);
  }
  RegisterProduct (table:string, product:string, quantity:string, notes:string, accompaniment:string, price:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    bodyLogin.append("product_id", product);
    bodyLogin.append("quantity", quantity);
    bodyLogin.append("notes", notes);
    bodyLogin.append("accompaniment", accompaniment);
    bodyLogin.append("price", price);
    bodyLogin.append("id_user", localStorage.getItem("user_id") || "");
    return this.http.post(this.urlService + "add_products.php", bodyLogin);
  }
  SendProductsToKitchen (pid:string, table:string, people:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    bodyLogin.append("table", table);
    bodyLogin.append("people", people);
    return this.http.post(this.urlService + "send_product_to_kitchen.php", bodyLogin);
  }
  AlertProduct(pid: string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    return this.http.post(this.urlService + "alert_product.php", bodyLogin);
  
  }
  //COCINA----------------------
  LoadKitchen (kitchen:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("kitchen", kitchen);
    return this.http.post(this.urlService + "load_pedidos.php", bodyLogin);
  }
  UpdateProductStatus (pid:string, state:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("pid", pid);
    bodyLogin.append("state", state);
    return this.http.post(this.urlService + "update_product_status.php", bodyLogin);
  }
  //FACTURA--------------------
  CreateInvoice (
    table:string, 
    total:string,
    cash:string,
    card:string,
    qr:string,
    debt:string,
    tickets:string,
    quantities:string,
    subtotals:string,
    ) {
    let bodyLogin = new FormData();
    bodyLogin.append("table", table);
    bodyLogin.append("total", total);
    bodyLogin.append("cash", cash);
    bodyLogin.append("card", card);
    bodyLogin.append("qr", qr);
    bodyLogin.append("debt", debt);
    bodyLogin.append("tickets", tickets);
    bodyLogin.append("quantities", quantities);
    bodyLogin.append("subtotals", subtotals);
    bodyLogin.append("user_cash", localStorage.getItem("cash_id") || "");
    return this.http.post(this.urlService + "add_invoice.php", bodyLogin);
  }
  //CIERRE DE CAJA--------------------
  OpenCash(floor:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("user_type", floor);
    bodyLogin.append("user_name", localStorage.getItem("user_id") || "");
    return this.http.post(this.urlService + "open_cash.php", bodyLogin);
  }
  CheckCash() {
    let bodyLogin = new FormData();
    bodyLogin.append("user_cash", localStorage.getItem("cash_id") || "");
    return this.http.post(this.urlService + "check_cash.php", bodyLogin);
  }
  CloseCash() {
    let bodyLogin = new FormData();
    bodyLogin.append("user_cash", localStorage.getItem("cash_id") || "");
    return this.http.post(this.urlService + "close_cash.php", bodyLogin);
  }
  AddExtraCost(id_table:string, cost:string, description:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("id_table", id_table);
    bodyLogin.append("cost", cost);
    bodyLogin.append("note", description);
    bodyLogin.append("id_user", localStorage.getItem("user_id") || "");
    bodyLogin.append("id_cash", localStorage.getItem("cash_id") || "");
    return this.http.post(this.urlService + "add_extra.php", bodyLogin);
  }
}
