import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ApiService } from 'src/app/shared/services/api.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observation } from 'src/app/shared/models/observation';
import { Signalement } from 'src/app/shared/models/signalement';

export interface Subject {
  name: string;
}

@Component({
  selector: 'app-ajouter-signalement',
  templateUrl: './ajouter-signalement.component.html',
})
export class AjouterSignalementComponent implements OnInit {
  @ViewChild('chipList') chipList;
  @ViewChild('resetSignalementForm') myNgForm;
  maxDate: Date;
  minDate: Date;
  selectedObservation: any;
  filteredObservations: Observation[] = [];
  selectedObservations: Observation[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  signalementForm: FormGroup;
  observations: Observation[];
  errorMessage: string;

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private signalementApi: ApiService
  ) {}

  /* Reactive book form */

  ngOnInit() {
    this.maxDate = new Date();
    this.minDate = new Date();
    this.minDate.setFullYear(this.minDate.getFullYear() - 100);
    this.signalementForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      birthDate: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required]],
      observations: [
        [],
        [
          Validators.required,
          (control: AbstractControl) => {
            if (control && control.value && control.value.length === 0) {
              return { required: true };
            }
            return null;
          },
        ],
      ],
    });

    this.signalementApi.getObservations().subscribe(
      (response: Observation[]) => {
        this.observations = response;
        this.filteredObservations = JSON.parse(JSON.stringify(response));
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }
  // traitement lors de la selection d'une observation dans la liste déroulante des observations et traitement des object dynamique
  onObservationInput(input: any): void {
    const value = (input.target as HTMLInputElement).value.trim().toLowerCase();

    if (value === '') {
      return;
    }

    this.filteredObservations = this.observations.filter((observation) =>
      observation.name.toLowerCase().includes(value)
    );
  }
  // traitement lors de la selection d'une observation dans les chips
  onObservationSelected(event: Observation): void {
    const selectedObservation = event as Observation;
    if (
      !this.selectedObservations.find((o) => o._id === selectedObservation._id)
    ) {
      this.selectedObservations.push(selectedObservation);
      this.signalementForm.controls.observations.setValue(
        this.selectedObservations.map((o) => o._id)
      );
    }

    this.signalementForm.controls.observations.markAsTouched();
    this.filteredObservations = this.filteredObservations.filter(
      (obj) => obj !== selectedObservation
    );
  }

  // traitement lors de la suppression d'une observation
  supprimerObservationSelectionne(observation: Observation): void {
    this.filteredObservations.push(observation);
    const index = this.selectedObservations.findIndex(
      (o) => o._id === observation._id
    );
    if (index >= 0) {
      this.selectedObservations.splice(index, 1);
      this.signalementForm.controls.observations.setValue(
        this.selectedObservations.map((o) => o._id)
      );
    }
  }
  // utilisé pour un affichage correct des chips
  displayFn(observation: Observation): string {
    return observation && observation.name ? observation.name : '';
  }

  /* creer signalement bouton click */
  submitSignalementForm(): void {
    if (this.signalementForm.valid) {
      const signalement: Signalement = {
        author: {
          first_name: this.signalementForm.value.firstName.trim(),
          last_name: this.signalementForm.value.lastName.trim(),
          birth_date: this.signalementForm.value.birthDate,
          sex: this.signalementForm.value.sex,
          email: this.signalementForm.value.email.trim(),
        },
        description: this.signalementForm.value.description.trim(),
        observations: this.signalementForm.value.observations,
      };

      this.signalementApi.creerSignalement(signalement).subscribe(
        () => {
          this.snackBar.open('Signalement ajouté avec succès', 'Fermer', {
            duration: 2000,
          });
          this.router.navigate(['/signalements-liste']);
        },
        (error) => {
          // gerer le scenario email existant
          if (error.status === 400) {
            console.log(
              "message d'erreur comme demandé par l'énnoncé",
              error.error
            );

            this.snackBar.open(
              `L'email ${this.signalementForm.value.email} est utilisé existe dans la base de données`,
              'Fermer',
              {
                duration: 3000,
              }
            );
          } else {
            this.errorMessage = error.message;
          }
        }
      );
    } else {
      this.signalementForm.markAllAsTouched();
    }
  }
}
