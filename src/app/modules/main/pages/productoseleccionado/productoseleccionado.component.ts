// Importaciones necesarias desde Angular y Firebase
import { AfterViewInit, Component, ElementRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';

import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from 'src/app/models/productos.interface';

import { debounceTime, Observable } from 'rxjs';

import { User as Userinterface } from "src/app/models/user.interface";
import { UserService } from 'src/app/shared/services/user.service';

import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, setDoc, getDoc, DocumentReference, query, where, getDocs } from '@angular/fire/firestore';

import { Router, NavigationEnd } from '@angular/router';

import { ActivatedRoute } from '@angular/router';
import { DocumentSnapshot, DocumentData } from 'firebase/firestore';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-productoseleccionado',
  templateUrl: './productoseleccionado.component.html',
  styleUrls: ['./productoseleccionado.component.css'],
  providers: [MessageService]
})
export class ProductoseleccionadoComponent implements OnInit{
  // Declaración de variables para gestionar productos
  productosCollection: any;
  productos$: Observable<Productos[]>;

  //prime ng
  messages: Message[] = [];


  constructor(private route: ActivatedRoute, private productosService: ProductosService, private firestore: Firestore, private auth: Auth, private messageService: MessageService) { 
    // Inicialización de colección y observables
    this.productosCollection = collection(firestore, 'productos');
    this.productos$ = collectionData(this.productosCollection) as Observable<Productos[]>;
  }

  // Declaración de variables adicionales para productos
  productos: Productos[] = [];
  productoSeleccionado: Productos | undefined;

  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Producto agregado al carrito', detail: 'Producto agregado correctamente' });
  }

  // Muestra un mensaje de error
  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error al agregar producto al carrito', detail: 'Error, no se pudo añadir el producto. Intente mas tarde' });
  }


  ngOnInit(): void {
    // Suscripción a cambios en los parámetros de la URL
    this.route.params.subscribe(params => {
      const productId = params['id'];
      const productosCollectionRef = collection(this.firestore, 'productos');
      const q = query(productosCollectionRef, where('id', '==', productId));
      
      // Obtener productos por ID
      getDocs(q).then(querySnapshot => {
        const productos: Productos[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data() as Productos;
          productos.push(data);
        });
        
        // Actualizar observable con productos obtenidos
        this.productos$ = new Observable<Productos[]>(observer => {
          observer.next(productos);
          observer.complete();
        });
        
        // Suscripción a cambios en el observable de productos
        this.productos$.subscribe(productos => {
          console.log(productos);
        });
      });
    });
  }

  // Función para agregar productos al carrito
  addToCart(producto: Productos) {
    // Obtener el UID del usuario logueado
    const uid = this.auth.currentUser?.uid;
    
    if (uid) {
      // Crear una referencia al documento del carrito del usuario
      const carritoRef = doc(this.firestore, `usuarios/${uid}/carrito/${producto.id}`);
    
      // Verificar si el carrito ya existe
      getDoc(carritoRef).then((snapshot) => {
        if (snapshot.exists()) {
          // El carrito ya existe, obtener el arreglo de productos
          const carritoData = snapshot.data();
          const productos = carritoData?.['productos'] || [];
    
          // Verificar si el producto ya está presente en el arreglo
          const existingProduct = productos.find((p: Productos) => p.id === producto.id);
          
          if (existingProduct) {
            // El producto ya existe, actualizar su cantidad
            existingProduct.cantidad = (existingProduct.cantidad || 0) + 1;
            console.log("Cantidad después de la actualización:", existingProduct.cantidad);
          } else {
            // El producto no existe, agregarlo al arreglo
            productos.push({ ...producto, cantidad: 1 });
          }
    
          setDoc(carritoRef, { ['productos']: productos }, { merge: true });
          console.log("El carrito existe, entre en el primer IF");
         // alert("Producto agregado al carrito")
          this.showSuccess()
        } else {
          // El carrito no existe, crearlo y agregar el producto
          const productos = [{ ...producto, cantidad: 1 }];
          setDoc(carritoRef, { ['productos']: productos });
        }
      }).catch((error) => {
        console.error('Error al acceder al carrito:', error);
        this.showError()
      });
    }
  }
}
