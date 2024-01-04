import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MensajeriaService } from '../../../../../shared/services/mensajeria.service';
import { User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../../../../shared/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  conversationId: string | null = null;
  messages: any[] = []; // Mensajes de la conversación
  newMessage: string = ''; // Campo para almacenar el nuevo mensaje
  receiverId: string | undefined;
  user: User | null = null; // Usuario actual, inicializado con null
  login: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private mensajeriaService: MensajeriaService,
    private auth: Auth,
    private userService: UserService,
  ) {
    // Verifica el estado de inicio de sesión del usuario
    this.userService.isLoggedIn().subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        console.log('El usuario está logueado');
        this.login = true;
        this.user = this.auth.currentUser; // Obtén el usuario logueado
      } else {
        console.log('El usuario no está logueado');
        this.login = false;
      }
    });
  }

  timestampToDate(timestamp: any): Date {
    return timestamp.toDate();
  }

  ngOnInit(): void {
    // Obtén el ID de la conversación desde los parámetros de la ruta
    this.route.paramMap.subscribe((params) => {
      this.conversationId = params.get('id');

      if (this.conversationId) {
        // Cargar mensajes de la conversación y ordenarlos por fecha y hora
        this.mensajeriaService.getMessages(this.conversationId).subscribe((messages) => {
          this.messages = messages.sort((a, b) => a.timestamp - b.timestamp);

          // Marcar los mensajes como leídos al cargarlos
          this.markMessagesAsRead();
        });
      }
    });
  }

  // Marcar mensajes como leídos
  markMessagesAsRead(): void {
    this.messages.forEach((message) => {
      if (message.senderId !== this.user!.uid && !message.isRead) {
        message.isRead = true;
  
        // Llama al servicio para actualizar el estado en la base de datos
        this.mensajeriaService.markMessageAsRead(this.conversationId!, message.id);
      }
    });
  }

  // Enviar mensaje
  enviarMensaje() {
    if (this.newMessage.trim() !== '') {
      const message = {
        text: this.newMessage,
        timestamp: new Date(),
        isRead: false,
      };
  
      // Llama al servicio para enviar el mensaje
      this.mensajeriaService.sendMessage(this.conversationId!, message);

      this.newMessage = ''; // Limpiar el campo de entrada después de enviar el mensaje
  
      // Marcar los mensajes como leídos después de enviar el mensaje
      this.markMessagesAsRead();
    }
  }
}
