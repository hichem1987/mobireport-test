import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h1 mat-dialog-title>Confirmation</h1>
    <div mat-dialog-content>{{ data }}</div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true" (click)="onYesClick()">
        Yes
      </button>
      <button mat-button [mat-dialog-close]="false" (click)="onNoClick()">
        No
      </button>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}
  onNoClick(): void {
    console.log('No clicked');
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    console.log('Yes clicked');
    this.dialogRef.close(true);
  }
}
