import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
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
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
  /*   onObservationInput(input: any) {
    const value = (input.target as HTMLInputElement).value;

    if (!value) {
      this.filteredObservations = this.observations;
      return;
    }

    const filterValue = value.toLowerCase();
    this.filteredObservations = this.observations.filter((observation) =>
      observation.name.toLowerCase().includes(filterValue)
    );
  }

  onObservationSelected(observation: any) {
    if (!this.selectedObservations.find((o) => o._id === observation._id)) {
      this.selectedObservations.push(observation);
    }
    this.filteredObservations = [];
  }

  removeSelectedObservation(observation: Observation) {
    const index = this.selectedObservations.findIndex(
      (o) => o._id === observation._id
    );
    if (index >= 0) {
      this.selectedObservations.splice(index, 1);
      this.signalementForm.controls['observations'].setValue(
        this.selectedObservations.map((o) => o._id)
      );
    }
  } */
  onObservationInput(input: any): void {
    const value = (input.target as HTMLInputElement).value.trim().toLowerCase();

    if (value === '') {
      //this.filteredObservations = [];
      return;
    }

    this.filteredObservations = this.observations.filter((observation) =>
      observation.name.toLowerCase().includes(value)
    );
  }

  onObservationSelected(event: Observation): void {
    console.log('event', event);
    const selectedObservation = event as Observation;
    console.log(
      'selectedObservation',
      selectedObservation,
      'this.selectedObservation',
      this.selectedObservations
    );
    console.log(
      '   !this.selectedObservations.find((o) => o._id === selectedObservation._id)',
      !this.selectedObservations.find((o) => o._id === selectedObservation._id)
    );
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

  removeSelectedObservation(observation: Observation) {
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

  displayFn(observation: Observation): string {
    return observation && observation.name ? observation.name : '';
  }

  /* Submit book */
  submitSignalementForm() {
    /*     if (this.signalementForm.valid) {
      this.signalementApi
        .AddSignalement(this.signalementForm.value)
        .subscribe((res) => {
          this.ngZone.run(() =>
            this.router.navigateByUrl('/signalements-list')
          );
        });
    } */
    if (this.signalementForm.valid) {
      console.log('this.signalementForm.value', this.signalementForm.value);
      const signalement: Signalement = {
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

      this.signalementApi.creerSignalement(signalement).subscribe(
        () => {
          this.snackBar.open('Signalement ajouté avec succès', 'Fermer', {
            duration: 2000,
          });
          this.router.navigate(['/signalements-list']);
        },
        (error) => {
          if (error.status === 400) {
            const formErrors = error.error;
            Object.keys(formErrors).forEach((key) => {
              const errors = formErrors[key];
              const control = this.signalementForm.get(key);
              if (control) {
                control.setErrors({ serverError: errors });
              }
            });
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
