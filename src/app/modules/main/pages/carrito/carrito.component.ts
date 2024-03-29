// Importaciones necesarias desde Angular y Firebase
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Componente para el carrito de compras
@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit{
  cartItems$: Observable<any[]>; // Observable para los elementos del carrito
  preciototal: number = 0; // Precio total inicializado en 0

  constructor(private firestore: Firestore, private auth: Auth) {
    this.cartItems$ = new Observable<any[]>(); // Inicializar el Observable
  }

  ngOnInit() {
    this.cartItems$ = new Observable<any[]>(); // Inicializar el Observable

    // Suscribirse a cambios en el estado de autenticación del usuario
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        const uid = user.uid;
        const carritoRef = collection(this.firestore, `usuarios/${uid}/carrito`);
        
        // Obtener los datos del carrito y calcular el precio total
        this.cartItems$ = collectionData(carritoRef).pipe(
          map((cartItems: any[]) => {
            this.preciototal = 0; // Reiniciar el precio total antes de recalcularlo

            // Obtener todos los productos de todos los items del carrito
            const productos = cartItems.flatMap((cartItem: any) => {
              return cartItem.productos || [];
            });

            this.calculateTotalPrice(productos); // Calcular el precio total
            return productos;
          })
        );
      } else {
        this.cartItems$ = new Observable<any[]>(); // Reiniciar el Observable si el usuario no está autenticado
        this.preciototal = 0; // Reiniciar el precio total si el usuario no está autenticado
      }
    });
  }

  // Calcular el precio total de los productos en el carrito
  calculateTotalPrice(productos: any[]) {
    this.preciototal = 0; // Reiniciar el precio total antes de recalcularlo

    for (const producto of productos) {
      const cantidad = producto.cantidad || 1; // Obtener la cantidad del producto
      const precioUnitario = producto.precio || 0; // Obtener el precio unitario del producto
      const subtotal = precioUnitario * cantidad; // Calcular el subtotal del producto
      this.preciototal += subtotal; // Sumar el subtotal al precio total
    }

    console.log(this.preciototal);
  }

  // Eliminar un producto del carrito
  eliminarProducto(producto: any) {
    // Obtener el UID del usuario logueado
    const uid = this.auth.currentUser?.uid;

    if (uid) {
      // Crear una referencia al documento del carrito del usuario
      const carritoRef = doc(this.firestore, `usuarios/${uid}/carrito/${producto.id}`);

      // Obtener el carrito actual
      getDoc(carritoRef).then((snapshot) => {
        if (snapshot.exists()) {
          // El carrito existe, obtener el arreglo de productos
          const carritoData = snapshot.data();
          const productos = carritoData?.['productos'] || [];

          // Encontrar el índice del producto a eliminar en el arreglo
          const index = productos.findIndex((p: any) => p.id === producto.id);

          if (index !== -1) {
            // Actualizar la cantidad total
            this.preciototal -= producto.precio * producto.cantidad;

            // Eliminar el producto del arreglo
            productos.splice(index, 1);

            // Actualizar el documento del carrito con el nuevo arreglo de productos
            setDoc(carritoRef, { ['productos']: productos }, { merge: true });
          }
        }
      }).catch((error) => {
        console.error('Error al eliminar el producto:', error);
      });
    }
  }

  // Disminuir la cantidad de un producto en el carrito
  decreaseQuantity(producto: any) {
    if (producto.cantidad > 1) {
      producto.cantidad -= 1;
      console.log('Cantidad del producto disminuida:', producto.cantidad);
      this.updateCartItem(producto);
    }
  }

  // Aumentar la cantidad de un producto en el carrito
  increaseQuantity(producto: any) {
    producto.cantidad += 1;
    console.log('Cantidad del producto aumentada:', producto.cantidad);
    this.updateCartItem(producto);
  }

  // Actualizar la cantidad de un producto en el

  updateCartItem(producto: any) {
    const uid = this.auth.currentUser?.uid;

    if (uid) {
      const carritoRef = doc(this.firestore, `usuarios/${uid}/carrito/${producto.id}`);
      getDoc(carritoRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const carritoData = snapshot.data();
            const productos = carritoData?.['productos'] || [];
            const index = productos.findIndex((p: any) => p.id === producto.id);

            if (index !== -1) {
              productos[index].cantidad = producto.cantidad;
              setDoc(carritoRef, { productos }, { merge: true })
                .then(() => {
                  console.log('Cantidad del producto actualizada');
                })
                .catch((error) => {
                  console.error('Error al actualizar la cantidad del producto:', error);
                });
            }
          }
        })
        .catch((error) => {
          console.error('Error al obtener el carrito:', error);
        });
    }
  }

}