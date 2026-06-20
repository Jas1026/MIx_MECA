import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ServerContentService } from '../../services/server-content.service';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class OrderModalComponent implements OnInit {

  @Input() order_id: any;

  @Input() editMode: boolean = false;

  @Input() table: any;


  // MOBILE

  mobileTab = 'order';


  // DATA

  categories: any[] = [];

  products: any[] = [];

  cart: any[] = [];



  // SEARCH

  searchTerm = '';

  searchResults: any[] = [];

  subcategoryResults: any[] = [];

  // NAV

  selectedCategory: any = null;

  selectedSubcategory: any = null;


  viewMode:

    'categories'

    |

    'products'

    =

    'categories';


  currentCategoryName = '';



  constructor(

    private server: ServerContentService,

    private modalCtrl: ModalController

  ) {

  }



  ngOnInit() {


    this.loadCategories();


    if (

      this.editMode

      &&

      this.order_id

    ) {

      this.loadOrderDetails();

    }

  }





  // =====================

  // CATEGORIAS

  // =====================


  loadCategories() {

    this.server

      .getCategories()

      .subscribe((res: any) => {


        this.categories =

          res.data || res;



        this.categories

          .forEach(cat => {


            cat.subcategories = [];



            this.server

              .getSubcategories(cat.id)

              .subscribe((sub: any) => {


                cat.subcategories =

                  sub.data || sub;
                cat.subcategories.forEach((subcat: any) => {


                  this.server

                    .getProductsCountBySubcategory(

                      subcat.id_subcategory

                    )

                    .subscribe((r: any) => {


                      subcat.totalProducts =


                        r.data.total;


                    });


                });

              });


          });


      });

  }





  selectSubcategory(sub: any) {

    this.selectedSubcategory = sub;


    this.currentCategoryName =

      sub.name;


    this.viewMode = 'products';



    this.server

      .getProductsBySubcategory(

        sub.id_subcategory

      )

      .subscribe((res: any) => {


        this.products =

          res.data || res;


      });

  }





  goBack() {


    this.viewMode = 'categories';


    this.products = [];


  }




  // =====================

  // BUSCADOR

  // =====================

  searchProducts() {

    if (this.searchTerm.trim() == '') {

      this.searchResults = [];

      this.subcategoryResults = [];

      return;

    }

    // Productos
    this.server.searchProducts(this.searchTerm)

      .subscribe((res: any) => {

        this.searchResults = res.data || res;

      });



    // Subcategorias locales

    const term =

      this.searchTerm.toLowerCase();



    this.subcategoryResults =

      [];



    this.categories.forEach((cat: any) => {

      (cat.subcategories || [])

        .forEach((sub: any) => {

          if (

            sub.name

              .toLowerCase()

              .includes(term)

          ) {

            this.subcategoryResults.push(sub);

          }

        });

    });

  }



  // =====================

  // CARRITO

  // =====================

addProduct(product:any){

  this.cart.push({

    id_product: product.id_product,

    name: product.name,

    price: product.price,

    quantity:1,

    notes:'',

    sides:'',

    isPriceEditable:false

  });

}



  removeProduct(product: any) {


    const index =


      this.cart.findIndex(


        p =>

          p.id_product ===

          product.id_product

      );



    if (index > -1) {


      if (

        this.cart[index]

          .quantity

        > 1

      ) {


        this.cart[index]

          .quantity--;


      }

      else {


        this.cart

          .splice(index, 1);


      }


    }


  }





  deleteFromCart(product: any) {


    this.cart =


      this.cart.filter(


        p =>

          p.id_product !==

          product.id_product

      );


  }




  clearCart() {


    this.cart = [];


  }





  getTotal() {


    return this.cart.reduce(


      (

        sum,

        item

      ) =>


        sum +


        (

          item.price

          *

          item.quantity

        )


      , 0);


  }





  // =====================

  // EDITAR PEDIDO

  // =====================


  loadOrderDetails() {
    this.server
      .getOrderProducts_unit(this.order_id)
      .subscribe((res: any) => {
        // Validamos que la respuesta sea correcta (error === 0) y traiga datos
        if (res && res.error === 0 && res.data) {

          this.cart = res.data.map((item: any) => ({
            id_product: item.product_id,
            name: item.nombre_producto,
            price: parseFloat(item.unit_price),
            quantity: parseInt(item.quantity, 10),
            notes: item.notes || '',
            sides: item.sides || '',
            isPriceEditable: false
          }));

          // Si estás en móvil, esto fuerza a que se pueda ver el listado o resumen correctamente actualizado
          console.log('Carrito cargado en edición:', this.cart);
        } else {
          console.warn('No se pudieron obtener los productos del pedido o el pedido está vacío.');
        }
      }, error => {
        console.error('Error cargando detalles del pedido:', error);
      });
  }



  // =====================

  // CONFIRMAR

  // =====================
  confirmOrder() {
    const id_user = sessionStorage.getItem('user_id') || '';

    if (this.editMode) {
      // ==========================================
      // MODO EDICIÓN: LLAMAR A UPDATE
      // ==========================================
      this.server
        .updateOrder_a(
          this.order_id,
          id_user,
          this.cart,
          false
        )
        .subscribe({
          next: (res: any) => {
            if (res.error === 0) {
              alert('✅ ' + res.message);
              this.modalCtrl.dismiss(true); // Retorna true para refrescar la lista de pedidos
            } else if (res.error === 2) {
              alert('🚫 STOCK INSUFICIENTE\n\n' + res.message);
            } else {
              alert('❌ ' + res.message);
            }
          },
          error: (err) => {
            console.error(err);
            alert('Error de conexión al actualizar');
          }
        });

    } else {
      // ==========================================
      // MODO NUEVO PEDIDO: LLAMAR A CREATE
      // ==========================================
      this.server
        .createOrder(
          this.table.id_table,
          id_user,
          this.cart,
          false
        )
        .subscribe({
          next: (res: any) => {
            if (res.error === 0) {
              alert('✅ ' + res.message);
              this.modalCtrl.dismiss(true);
            } else if (res.error === 2) {
              alert('🚫 STOCK INSUFICIENTE\n\n' + res.message);
            } else {
              alert('❌ ' + res.message);
            }
          },
          error: (err) => {
            console.error(err);
            alert('Error de conexión');
          }
        });
    }
  }





  toggleMobileTab(tab: string) {


    this.mobileTab = tab;


  }





  close() {


    this.modalCtrl.dismiss();


  }

}