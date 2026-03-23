import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // <--- AÑADE ESTA LÍNEA
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
  getFlats_panel() {
    let body = new FormData();
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_flats_panel.php", body);
  }
  getTables(id_flat: string) {
    let body = new FormData();
    body.append("id_flat", id_flat);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_tables.php", body);
  }
  getTables_new(id_flat: string) {
    let body = new FormData();
    body.append("id_flat", id_flat);
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "get_tables_new.php", body);
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
createOrder(id_table: any, id_user: any, products: any[], force: boolean = false) {
  const formData = new FormData();
  formData.append('id_table', id_table.toString()); // Aseguramos string para FormData
  formData.append('id_user', id_user.toString());
  formData.append('products', JSON.stringify(products));
  formData.append('system', this.getSystem());
  
  // Convertimos el boolean a string para el servidor
  formData.append('force_order', force ? 'true' : 'false'); 

  return this.http.post(`${this.urlService}create_order.php`, formData);
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
  
updateDetailStatus(detailId: number, status: string = 'ready') {
  let body = new FormData();
  body.append("detail_id", detailId.toString());
  body.append("status", status);
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
  closeOrder_for(orderId: number) {
    let body = new FormData();
    body.append("order_id", orderId.toString());
    body.append("system", this.getSystem());

    return this.http.post(this.urlService + "close_order_obl.php", body);
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

//getInformes(system: string) {
  //return this.http.get(`${this.urlService}get_informes_resumen.php?system=${system}`);
//}

 
 getResumen(tipo: string, fechaInicio: string, fechaFin: string) {
  return this.http.get(`${this.urlService}/get_informes_resumen.php`, {
    params: {
      tipo: tipo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }
  });
}

 
get_datos_ing(system: string, area: string) {
  return this.http.get(
    `${this.urlService}validate_ingredients.php`
  );
}


 // En server-content.service.ts
// server-content.service.ts
addBottle(data: any) {
  let body = new FormData();
  body.append("ingredient_id", data.ingredient_id.toString());
  body.append("peso_envase", data.peso_envase.toString());
  body.append("capacidad_total", data.capacidad_total.toString());
  body.append("peso_actual", data.peso_actual.toString());
  body.append("cantidad", data.cantidad.toString()); // <--- ESTA LÍNEA ES VITAL
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + "add_bottle.php", body);
}
getBottles(ingredientId: any) {
  let body = new FormData();
  body.append("ingredient_id", ingredientId.toString());
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + "get_bottles.php", body);
}

updateBottleWeight(data: any) {
  let body = new FormData();
  body.append("id_bottle", data.id_bottle.toString());
  body.append("peso_actual", data.peso_actual.toString());
  body.append("estado", data.estado);
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + "update_bottle.php", body);
}
addCategory(name: string) {
  let body = new FormData();
  body.append("name", name);
  body.append("system", this.getSystem()); // <-- Ahora sí incluimos el sistema

  return this.http.post(`${this.urlService}add_category.php`, body);
}

updateCategory(cat: any) {
  let body = new FormData();
  body.append("id", cat.id.toString());
  body.append("name", cat.name);
  body.append("system", this.getSystem()); // <-- Indispensable

  return this.http.post(`${this.urlService}update_category.php`, body);
}

deleteCategory(id: any) {
  let body = new FormData();
  body.append("id", id.toString());
  body.append("system", this.getSystem()); // <-- Indispensable

  return this.http.post(`${this.urlService}delete_category.php`, body);
}

changeOrderTable(orderId: number, newTableId: number) {
  let body = new FormData();
  body.append("order_id", orderId.toString());
  body.append("new_table_id", newTableId.toString());
  body.append("system", this.getSystem());

  return this.http.post(`${this.urlService}change_order_table.php`, body);
}



















 
 
 
 
 

// ---------------- GESTIÓN DE PISOS ----------------

getFlatsCom(system: string) {
  return this.http.get(`${this.urlService}get_flats_complete.php?system=${system}`);
}

createFlat(body: FormData) {
  return this.http.post(`${this.urlService}create_flat.php`, body);
}
updateFlatState(body: FormData) {
  return this.http.post(`${this.urlService}toggle_flat_state.php`, body);
}
// ---------------- GESTIÓN DE MESAS ----------------

getTables_complete(system: string) {
  return this.http.get(`${this.urlService}get_tables_comp.php?system=${system}`);
}

createTable(body: FormData) {
  return this.http.post(`${this.urlService}create_table.php`, body);
}

updateTableState(body: FormData) {
  return this.http.post(`${this.urlService}toggle_table_state.php`, body);
}

// ---------------- GESTIÓN DE USUARIOS ----------------

getUsers(system: string) {
  return this.http.get(`${this.urlService}get_users.php?system=${system}`);
}

createUser(body: FormData) {
  return this.http.post(`${this.urlService}create_user.php`, body);
}

updateUserState(body: FormData) {
  // Asegúrate de que la ruta apunte al archivo toggle_user_state.php
  return this.http.post(`${this.urlService}toggle_user_state.php`, body);
}
emitirFacturaReal(payload: any) {
  // Obtenemos el sistema (mixtura o mecapos) desde donde lo tengas guardado
  const sistemaActivo = localStorage.getItem('sistema') || 'mixtura'; 
  
  // Añadimos el sistema al objeto que enviamos
  const data = { ...payload, system: sistemaActivo };

  return this.http.post(`${this.urlService}/emitirFacturaLocal.php`, data);
}
getOrdersByUser(userId: string) {
  let body = new FormData();
  body.append("user_id", userId);
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + "getOrdersByUser.php", body);
}
getOrderProducts(orderId: any) {
  // Cambiamos a FormData para que sea igual a tus otras funciones de Órdenes
  let body = new FormData();
  body.append("order_id", orderId.toString());
  body.append("system", this.getSystem());

  // Usamos POST para enviar el FormData completo
  return this.http.post(`${this.urlService}get_order_products.php`, body);
}
triggerAlert(detailId: any) {
  let body = new FormData();
  body.append("detail_id", detailId.toString()); // Asegúrate que sea 'detail_id'
  body.append("system", this.getSystem());
  return this.http.post(this.urlService + "trigger_alert.php", body);
}
silenceAlert(detailId: number) {
  let body = new FormData();
  body.append("detail_id", detailId.toString());
  body.append("system", this.getSystem());
  return this.http.post(this.urlService + "silence_alert.php", body);
}

searchProducts(term: string) {

  let body = new FormData();
  body.append("term", term);
  body.append("system", this.getSystem());

  return this.http.post(this.urlService + 'search_products.php', body);

}
getHistorialPagos(orderId: number) {
  const sistemaActivo = localStorage.getItem('sistema') || 'mixtura';
  // Usamos params de URL porque el PHP espera un GET
  return this.http.get(`${this.urlService}/getHistorialPagos.php?order_id=${orderId}&system=${sistemaActivo}`);
}


/**
 * Procesa todos los bloques de pago acumulados en la canasta de cobro
 * @param payload Objeto que contiene order_id, el array de pagos y el sistema
 */
procesarMultiplesPagos(payload: any) {
  // Aseguramos que el sistema viaje en el cuerpo de la petición
  const sistemaActivo = localStorage.getItem('sistema') || 'mixtura';
  const data = { ...payload, system: sistemaActivo };

  return this.http.post(`${this.urlService}/procesarMultiplesPagos.php`, data);
}
getExistingAdjustments(detailId: number): Observable<any> {
  // Usamos FormData para que coincida con tu estándar
  let body = new FormData();
  body.append("detail_id", detailId.toString());
  body.append("system", this.getSystem());

  return this.http.post(`${this.urlService}get_adjustments.php`, body);
}

saveAdjustments(detailId: number, adjustments: any[]): Observable<any> {
  let body = new FormData();
  body.append("detail_id", detailId.toString());
  // Los arrays se deben enviar como string JSON en FormData
  body.append("adjustments", JSON.stringify(adjustments));
  body.append("system", this.getSystem());

  return this.http.post(`${this.urlService}save_detail_adjustments.php`, body);
}



validateRecipeStock(cart: any[]): Observable<any> {
  const formData = new FormData();
  
  // Usamos el método centralizado getSystem() que ya tienes en tu clase
  formData.append('products', JSON.stringify(cart));
  formData.append('system', this.getSystem());

  // Eliminamos el "/" extra si urlService ya termina en "/"
  return this.http.post(`${this.urlService}validate_ingredients.php`, formData);
}

// Dentro de ServerContentService
getDetalleArea(system: string, area: string): Observable<any> {
  let body = new FormData();
  body.append("system", system);
  body.append("area", area);

  return this.http.post(this.urlService + "get_detalle_area.php", body);
}
// 1. Obtener Ingredientes de la BD contraria
getExternalIngredients(targetSystem: string): Observable<any> {
  let body = new FormData();
  body.append("system", targetSystem);
  // Reutilizamos el mismo PHP que ya tienes para listar ingredientes, 
  // pero pasándole el sistema destino
  return this.http.post(this.urlService + "get_ingredients.php", body);
}
deleteAdjustment(detailId: number, ingredientId: number): Observable<any> {
  let body = new FormData();
  body.append("detail_id", detailId.toString());
  body.append("ingredient_id", ingredientId.toString());
  body.append("system", this.getSystem());

  return this.http.post(`${this.urlService}delete_adjustment.php`, body);
}
// 2. Obtener Productos de la BD contraria (Para que no te de el error 2339)
getProductsExternal(targetSystem: string): Observable<any> {
  let body = new FormData();
  body.append("system", targetSystem);
  return this.http.post(this.urlService + "get_products.php", body);
}

// 3. Ejecutar la transferencia por Nombres
transferStockByNames(data: any): Observable<any> {
  let body = new FormData();
  body.append("from_system", data.from_system);
  body.append("to_system", data.to_system);
  body.append("type", data.type);
  body.append("items", JSON.stringify(data.items));
  
  return this.http.post(this.urlService + "transfer_inventory.php", body);
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
