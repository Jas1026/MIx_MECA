import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerContentService {

  private urlService = "http://localhost/api/";
//private urlService = "http://192.168.88.204/api/mixtura/posAdmin/index.php/";

  constructor(private http: HttpClient) { }
//LOGIN------------------------
setSystem(system: 'mixtura' | 'meca') {
  if (system === 'mixtura') {
    this.urlService = "http://localhost/api/";
  } else {
    this.urlService = "http://localhost/api/";
  }
}
LoginWithPassword(code: string, password: string, system: string) {
  let body = new FormData();
  body.append("code", code);
  body.append("password", password);
  body.append("system", system);

  return this.http.post(this.urlService + "login_user.php", body);
}
  Login (code:string, floor:string) {
    let bodyLogin = new FormData();
    bodyLogin.append("code", code);
    bodyLogin.append("user_type", floor);
    return this.http.post(this.urlService + "login.php", bodyLogin);
  }
  Logout () {
    let bodyLogin = new FormData();
    bodyLogin.append("user_cash", localStorage.getItem("cash_id") || "");
    bodyLogin.append("id_user", localStorage.getItem("id_user") || "");
    return this.http.post(this.urlService + "logout.php", bodyLogin);
  }
getFlats(system: string) {

  let body = new FormData();
  body.append("system", system);

  return this.http.post(this.urlService + "get_flats.php", body);
}

getTables(system: string, id_flat: string) {

  let body = new FormData();
  body.append("system", system);
  body.append("id_flat", id_flat);

  return this.http.post(this.urlService + "get_tables.php", body);
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
