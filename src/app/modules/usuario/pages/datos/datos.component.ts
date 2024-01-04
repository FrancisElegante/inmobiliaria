// Importaciones necesarias desde Angular y Firebase
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.css'],
  providers: [MessageService]
})
export class DatosComponent implements OnInit {

  // Declaración de variables
  userForm: FormGroup; // Formulario reactivo para la gestión de datos del usuario
  currentUser: User | null = null; // Usuario actual
  userData: any = {}; // Datos del usuario
  messages: Message[] = []; // Inicializa messages como un array vacío

  // Validador personalizado para verificar que el campo no esté vacío
  notEmptyValidator(control: AbstractControl) {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return { 'notEmpty': true };
    }
    return null;
  }

  // Constructor con inyección de servicios y dependencias
  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {
    // Inicialización del formulario reactivo con validadores
    this.userForm = this.formBuilder.group({
      nombre: ['',
        [Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
        this.notEmptyValidator
        ]],
      apellido: ['',
        [Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
        this.notEmptyValidator
        ]],
      imagen: ['',
       Validators.required
      ]
    });
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    // Suscripción al cambio de estado de autenticación del usuario
    this.auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.currentUser = user;
        const uid = user.uid;
        const userRef = doc(this.firestore, `usuarios/${uid}`);
        getDoc(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            this.userData = snapshot.data();
            this.userForm.patchValue(this.userData);
          }
        }).catch((error) => {
          console.error('Error al obtener los datos del usuario:', error);
        });
      } else {
        this.currentUser = null;
        this.userData = {};
      }
    });
  }

  // Método para mostrar un mensaje de éxito
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Datos Cambiados!', detail: 'Datos cambiados correctamente' });
  }

  // Método para mostrar un mensaje de error
  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error al cambiar los datos!', detail: 'Error, no se pudieron cambiar los datos. Inténtelo más tarde' });
  }

  // Método para guardar los datos del usuario
  guardarDatos() {
    if (this.currentUser) {
      const uid = this.currentUser.uid;
      const userRef = doc(this.firestore, `usuarios/${uid}`);
      const formData = this.userForm.value;
      setDoc(userRef, formData, { merge: true })
        .then(() => {
          console.log('Datos actualizados correctamente');
          this.showSuccess();
          setTimeout(() => {
            this.router.navigateByUrl('/usuario/usuario');
          }, 2000);
        })
        .catch((error) => {
          console.error('Error al actualizar los datos:', error);
          this.showError();
        });
    }
  }
}
