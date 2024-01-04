// Importaciones necesarias desde Angular y Firebase
import { AfterViewInit, Component, ElementRef, OnInit, inject, ViewChild  } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { debounceTime, Observable } from 'rxjs';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, setDoc, getDoc, DocumentReference } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';

import { UserService } from 'src/app/shared/services/user.service';
import { User as Userinterface } from "../../../../models/user.interface";
import { ProductosService } from 'src/app/shared/services/productos.service';
import { Productos } from "../../../../models/productos.interface";

import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Message } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [MessageService]
})
export class MainComponent implements OnInit, AfterViewInit{
  // Variables para gestionar la selección y búsqueda de productos
  tipoProductoSeleccionado: string = '';
  buscar: string = '';
  lista_productos: any = [];
  lista_imagenes: any = [];
  dynamicText: string = '';
  _productosService = inject(ProductosService);
  productos$!: Observable<Productos[]>;
  nombreusuario: string = '';
  apellidousuario: string = '';
  user$!: Observable<Userinterface[]>;
  inicie: number = 0

  //prime ng
  messages: Message[] = [];


  user: User | null = null; // Initialize with null
  login: boolean = false;
  rol: 'comprador' | 'admin' = 'comprador';

  constructor(private elementRef: ElementRef, private auth: Auth, private userService: UserService, private firestore: Firestore,  private router: Router,     private messageService: MessageService
    )  {
    this.userService.isLoggedIn().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        console.log('El usuario está logueado');
        
        // Realiza las acciones necesarias cuando el usuario está logueado
        this.login = true;
        // Obtener el UID del usuario logueado
        const user = this.auth.currentUser;
        if (user) {
          const uid = user.uid;
          this.getDatosUser3(uid); // Pasar el UID a la funciónk
        }
      } else {
        console.log('El usuario no está logueado');
        // Realiza las acciones necesarias cuando el usuario no está logueado
        this.login = false;
      }
    });
  }

  // Código nuevo para gestionar la lista de productos
  productos: Productos[] = [];
  productoSeleccionado: Productos | undefined;
  tiposProductos: string[] = [];

  // Controlador de formulario para la búsqueda
  searcher = new FormControl('');

  // muestra un mensaje de success
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Producto agregado al carrito', detail: 'Producto agregado correctamente' });
  }

  // Muestra un mensaje de error
  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error al agregar producto al carrito', detail: 'Error, no se pudo añadir el producto. Intente mas tarde' });
  }

  ngOnInit(): void {
    // Obtener todos los productos sin filtro inicial
    this.productos$ = this._productosService.getPlayers();

    // Suscribirse a cambios en el valor del control de búsqueda
    this.searcher.valueChanges.pipe(debounceTime(500)).subscribe((search) => {
      // Obtener productos filtrados por búsqueda
      this.productos$ = this._productosService.getPlayers(search || '');
    });

    // Obtener datos de usuario y productos
    this.user$ = this.userService.getUser();
    this.productos$ = this._productosService.getPlayers();

    // Código nuevo para obtener lugares y tipos de productos
    this._productosService.getPlaces().subscribe(productos => {
      this.productos = productos;
      this.tiposProductos = Array.from(new Set(productos.map(producto => producto.tipo))); // Filtrar productos

      console.log(this.productos); // Asegúrate de que los datos se estén asignando correctamente
      console.log(this.tiposProductos)
    }, error => {
      console.error('Error al obtener los productos:', error);
    });

    // Verificación y registro del Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.update().then(() => {
          // Actualización de la caché completada
          // Puedes realizar acciones adicionales aquí si es necesario
          window.location.reload(); // Recarga la página para obtener la versión actualizada de los recursos
        });
      });
    }
  }

  // Función para obtener datos del usuario
  getDatosUser() {
    this.user$.subscribe((users: Userinterface[]) => {
      if (users.length > 0) {
        console.log(users[0]); // Accede al primer usuario de la lista
      }
    });
  }

  // Código nuevo para agregar productos al carrito
  addToCart(producto: Productos) {
    const uid = this.auth.currentUser?.uid;
    
    if (uid) {
      const carritoRef = doc(this.firestore, `usuarios/${uid}/carrito/${producto.id}`);
    
      getDoc(carritoRef).then((snapshot) => {
        if (snapshot.exists()) {
          const carritoData = snapshot.data();
          const productos = carritoData?.['productos'] || [];
          
          const existingProduct = productos.find((p: Productos) => p.id === producto.id);
          
          if (existingProduct) {
            existingProduct.cantidad = (existingProduct.cantidad || 0) + 1;
            console.log("Cantidad después de la actualización:", existingProduct.cantidad);
          } else {
            productos.push({ ...producto, cantidad: 1 });
          }
    
          setDoc(carritoRef, { ['productos']: productos }, { merge: true });
          //alert("producto agregado al carrito")
          this.showSuccess()

        } else {
          const productos = [{ ...producto, cantidad: 1 }];
          setDoc(carritoRef, { ['productos']: productos });
        }
      }).catch((error) => {
        console.error('Error al acceder al carrito:', error);
        this.showError()
      });
    }
  }

  // Función para seleccionar un producto
  seleccionarProducto(producto: Productos) {
    this.productoSeleccionado = producto;
  }

  // Función para obtener datos del usuario mediante UID
  getDatosUser3(uid: string | undefined) {
    if (uid) {
      this.userService.getUserByUid(uid).subscribe(user => {
        if (user) {
          console.log('Usuario encontrado:', user);
          this.nombreusuario = user.nombre;
          this.apellidousuario= user.apellido
          console.log('Rol usuario', user.rol);
  
          if (this.productoSeleccionado) {
            // ?? Puedes agregar lógica adicional si es necesario
          }
  
          if (user.rol === 'comprador' || user.rol === 'admin') {
            this.rol = user.rol;
          } else {
            this.rol = 'comprador';
          }
        } else {
          console.log('Usuario no encontrado');
        }
      });
    }
  }

  // Función para navegar a la página de productos inspeccionados
  inspeccionar(producto : Productos){
    const productId = producto.id;
    console.log(productId)
    this.router.navigate(['/productoseleccionado', productId]);
    console.log("estoy funcionando :)")
  }

  // Configurar el slider después de que la vista se inicializa
  ngAfterViewInit(): void {
    
  }

  // Configurar el slider
 
}
