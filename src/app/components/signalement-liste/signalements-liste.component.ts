import { Signalement } from 'src/app/shared/models/signalement';
import { ApiService } from 'src/app/shared/services/api.service';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/modals/confirmation-dialog/confirmation-dialog.component';
import { Observation } from 'src/app/shared/models/observation';

@Component({
  selector: 'app-signalements-list',
  templateUrl: './signalements-liste.component.html',
})
export class SignalementsListeComponent {
  SignalementData: any = [];
  dataSource: MatTableDataSource<Signalement>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = [
    '_id',
    'signalement_first_name',
    'signalement_last_name',
    'signalement_sex',
    'signalement_birth_date',
    'signalement_email',
    'description',
    'observation',
    'action',
  ];

  constructor(private signalementApi: ApiService, public dialog: MatDialog) {
    this.signalementApi
      .getSignalements()
      .subscribe((signalements: [Signalement]) => {
        signalements.forEach((signalement, key) => {
          const date = new Date(signalement.author.birth_date);
          date.setDate(date.getDate() - 1);
          signalements[key].author.birth_date = date;
        });
        this.SignalementData = signalements;
        this.dataSource = new MatTableDataSource<Signalement>(
          this.SignalementData
        );
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        }, 0);
      });
  }
  // method pour supprimer un signalement
  supprimerSignalement(index: number, e: Signalement): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: 'être vous sure de vouloir supprimer cet élément?',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const data = this.dataSource.data;
        data.splice(
          this.paginator.pageIndex * this.paginator.pageSize + index,
          1
        );
        this.dataSource.data = data;
        this.signalementApi.supprimerSignalement(e._id).subscribe();
      }
    });
  }
}
