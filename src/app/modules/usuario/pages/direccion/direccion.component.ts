// Importaciones necesarias desde Angular y Firebase
import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-direccion',
  templateUrl: './direccion.component.html',
  styleUrls: ['./direccion.component.css'],
  providers: [MessageService]
})
export class DireccionComponent implements OnInit {
  // Declaración de variables
  direccionForm: FormGroup; // Formulario reactivo para la gestión de datos de dirección
  messages: Message[] = []; // Inicializa messages como un array vacío

  // Validador personalizado para verificar que el campo no esté vacío
  notEmptyValidator(control: AbstractControl) {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return { 'notEmpty': { valid: false } };
    }
    return null;
  }

  // Constructor con inyección de servicios y dependencias
  constructor(private firestore: Firestore, private auth: Auth, private router: Router, private messageService: MessageService) {
    // Inicialización del formulario reactivo con validadores
    this.direccionForm = new FormGroup({
      direccion: new FormControl('',
        [Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
        this.notEmptyValidator]),

      altura: new FormControl('',
        [Validators.pattern(/^[0-9]+$/),
        this.notEmptyValidator,
        Validators.required
        ]),

      provincia: new FormControl('',
        [Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
        this.notEmptyValidator]),

      ciudad: new FormControl('',
        [Validators.required,
        Validators.pattern(/^[a-zA-Z\s]*$/),
        this.notEmptyValidator]),

      codigoPostal: new FormControl('',
        [Validators.pattern(/^[0-9]+$/),
        this.notEmptyValidator,
        Validators.required
        ])
    });
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    // Obtener el UID del usuario logueado
    const uid = this.auth.currentUser?.uid;
    if (uid) {
      const direccionRef = doc(this.firestore, `usuarios/${uid}/direccion/datos`);

      // Obtener el documento de dirección si existe
      getDoc(direccionRef).then((snapshot) => {
        if (snapshot.exists()) {
          // Si el documento existe, establecer los valores del formulario con los datos guardados
          const direccionData = snapshot.data();
          this.direccionForm.setValue({
            direccion: direccionData['direccion'],
            altura: direccionData['altura'],
            provincia: direccionData['provincia'],
            ciudad: direccionData['ciudad'],
            codigoPostal: direccionData['codigoPostal']
          });
        }
      });
    }
  }

  // Método para mostrar un mensaje de éxito
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Datos Cambiados!', detail: 'Datos cambiados correctamente' });
  }

  // Método para mostrar un mensaje de error
  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error al cambiar los datos!', detail: 'Error, no se pudieron cambiar los datos. Inténtelo más tarde' });
  }

  // Método para guardar los datos de dirección
  guardarDireccion() {
    // Obtener el UID del usuario logueado
    const uid = this.auth.currentUser?.uid;
    if (uid) {
      // Obtener los valores del formulario
      const direccion = this.direccionForm.value.direccion;
      const altura = this.direccionForm.value.altura;
      const provincia = this.direccionForm.value.provincia;
      const ciudad = this.direccionForm.value.ciudad;
      const codigoPostal = this.direccionForm.value.codigoPostal;

      // Crear un objeto con los datos de dirección
      const direccionData = {
        direccion,
        altura,
        provincia,
        ciudad,
        codigoPostal
      };

      // Guardar los datos de dirección en la base de datos
      const direccionRef = doc(this.firestore, `usuarios/${uid}/direccion/datos`);
      setDoc(direccionRef, direccionData)
        .then(() => {
          console.log('Datos de dirección guardados correctamente');
          this.showSuccess();

          // Redirigir a la página de usuario después de guardar los datos
          this.router.navigateByUrl('/usuario');
        })
        .catch((error) => {
          this.showError();
          console.error('Error al guardar los datos de dirección:', error);
        });
    }
  }
}
