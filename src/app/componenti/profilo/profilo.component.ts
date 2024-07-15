import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProfiloService } from '../../servizi/profilo.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';
import { AuthService } from '../../servizi/auth.service';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FileUploadModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './profilo.component.html',
  styleUrl: './profilo.component.css'
})
export class ProfiloComponent implements OnInit{

 
  constructor(private confirmationService: ConfirmationService, 
              private messageService: MessageService, 
              private profileService:ProfiloService,
              private router:Router, 
              private authservice: AuthService
            ){}

  tokenKey: any
  token: any 
  userId: any;
  profileImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  

  utente: any

  ngOnInit(): void {
    this.tokenKey = 'Bearer Token'
    this.token = localStorage.getItem(this.tokenKey)!;
    console.log(this.token)
    this.userId = this.profileService.getIdFromToken(this.token)!;
    console.log(this.userId)

    this.profileService.getUser(this.userId)
    .subscribe((data) =>{
      this.utente = data
      console.log(this.utente)
    }) 

    this.loadProfileImage();
  }

  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profileImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  editConfirm(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Procedi con la modifica del profilo?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
            this.router.navigateByUrl('area-riservata/modifica-profilo');
        },
        reject: () => {
            this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Profilo non modificato', life: 3000 });
        }
    });
  }

  deleteConfirm(event: Event) {
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Cancellare per sempre questo account?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        acceptButtonStyleClass:"p-button-danger p-button-text",
        rejectButtonStyleClass:"p-button-text p-button-text",
        acceptIcon:"none",
        rejectIcon:"none",

        accept: () => {
          this.profileService.deleteUser(this.userId)
          this.router.navigateByUrl('/login');
        },
        reject: () => {
            this.messageService.add({ severity: 'info', summary: 'Rejected', detail: "L'account non è stato eliminato", life: 3000 });
        }
    });
   }

   
  loadProfileImage(): void {
    this.profileService.getPhoto(this.userId).subscribe({
      next: (response: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.profileImage = reader.result;
        };
        reader.readAsDataURL(response);
      },
      error: (error) => {
        console.error('Errore nel caricamento dell\'immagine del profilo', error);
      }
    });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadProfileImage();
    }
  }

  uploadProfileImage(): void {
    if (this.selectedFile) {
      const uploadObserver: Observer<any> = {
        next: (response: any) => {
          console.log('Immagine caricata con successo', response);
          this.loadProfileImage(); // Ricarica l'immagine per aggiornarla
        },
        error: (err: any) => {
          console.error('Errore nel caricamento dell\'immagine del profilo', err);
        },
        complete: () => {
          console.log('Upload immagine completato');
        }
      };

      this.profileService.addPhoto(this.userId, this.selectedFile).subscribe(uploadObserver);
    }
  }

  modificaImmagine(): void {
    if (this.selectedFile) {
      const editObserver: Observer<any> = {
        next: (response: any) => {
          console.log('Immagine modificata con successo', response);
          this.loadProfileImage(); // Ricarica l'immagine per aggiornarla
        },
        error: (err: any) => {
          console.error('Errore nella modifica dell\'immagine del profilo', err);
        },
        complete: () => {
          console.log('Modifica immagine completata');
        }
      };

      this.profileService.editPhoto(this.userId, this.selectedFile).subscribe(editObserver);
    }
  }

  eliminaImmagine(): void {
    const deleteObserver: Observer<any> = {
      next: (response: any) => {
        console.log('Immagine eliminata con successo', response);
        this.profileImage = null; // Rimuove l'immagine dall'interfaccia
      },
      error: (err: any) => {
        console.error('Errore nell\'eliminazione dell\'immagine del profilo', err);
      },
      complete: () => {
        console.log('Eliminazione immagine completata');
      }
    };

    this.profileService.deletePhoto(this.userId).subscribe(deleteObserver);
  }
}
