import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observation } from 'src/app/shared/models/observation';
import { ApiService } from 'src/app/shared/services/api.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { Signalement } from 'src/app/shared/models/signalement';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-modifier-signalement',
  templateUrl: './modifier-signalement.component.html',
})
export class ModifierSignalementComponent implements OnInit {
  @ViewChild('chipList') chipList;
  @ViewChild('resetSignalementForm') myNgForm;
  signalementForm: FormGroup;
  id: string;

  maxDate: Date;
  minDate: Date;
  selectedObservation: any;
  filteredObservations: Observation[] = [];
  selectedObservations: Observation[] = [];
  visible = true;
  loading = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  observations: Observation[];
  errorMessage: string;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.signalementForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      sex: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required],
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

    forkJoin(
      this.apiService.getSignalement(this.id),
      this.apiService.getObservations()
    ).subscribe({
      next: ([signalement, observations]: [
        Partial<Signalement>,
        Observation[]
      ]) => {
        this.signalementForm.patchValue({
          firstName: signalement.author.first_name,
          lastName: signalement.author.last_name,
          birthDate: new Date(signalement.author.birth_date)
            .toISOString()
            .substring(0, 10),
          sex: signalement.author.sex,
          email: signalement.author.email,
          description: signalement.description,
          observations: signalement.observations,
        });
        // filtrer l'object observation pour gérer le jeu entre le chip list et la liste déroulante
        this.selectedObservations = signalement.observations;
        for (let i = 0; i < observations.length; i++) {
          this.selectedObservations.forEach((selectedObservation) => {
            // pour gérer le cas ou tous les observations étaient selectionnés
            if (typeof observations[i] === 'undefined') {
              return true;
            }
            if (observations[i]._id === selectedObservation._id) {
              observations.splice(i, 1);
              if (i !== 0) {
                i = i - 1;
              }
              return true;
            }
          });
        }
        this.filteredObservations = observations;
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
      complete: () => (this.loading = false),
    });
  }
  // traitement lors de la selection d'une observation dans la liste déroulante des observations et traitement des object dynamique
  onObservationInput(input: any): void {
    const value = (input.target as HTMLInputElement).value.trim().toLowerCase();

    if (value === '') {
      return;
    }
    this.signalementForm.controls.observations.markAsDirty();
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
    this.signalementForm.controls.observations.markAsDirty();
    this.filteredObservations = this.filteredObservations.filter(
      (obj) => obj !== selectedObservation
    );
  }

  // traitement lors de la suppression d'une observation
  supprimerObservationSelectionne(observation: Observation): void {
    this.signalementForm.controls.observations.markAsDirty();
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
  // soumission formulaire modifier signalement
  onSubmit(): void {
    if (this.signalementForm.valid) {
      const payload = {
        _id: this.id,
        author: {
          first_name: this.signalementForm.value.firstName,
          last_name: this.signalementForm.value.lastName,
          birth_date: this.signalementForm.value.birthDate,
          sex: this.signalementForm.value.sex,
          email: this.signalementForm.value.email,
        },
        description: this.signalementForm.value.description,
        observations: this.signalementForm.value.observations,
      };

      this.apiService.modifierSignalement(this.id, payload).subscribe(
        () => {
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
              `l'email ${this.signalementForm.value.email} est utilisé existe dans la base de données`,
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
