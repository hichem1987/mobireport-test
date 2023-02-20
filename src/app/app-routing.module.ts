import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AjouterSignalementComponent } from './components/ajouter-signalement/ajouter-signalement.component';
import { ModifierSignalementComponent } from './components/modifier-signalement/modifier-signalement.component';
import { SignalementsListeComponent } from './components/signalement-liste/signalements-liste.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ajouter-signalement' },
  { path: 'ajouter-signalement', component: AjouterSignalementComponent },
  { path: 'edit-signalement/:id', component: ModifierSignalementComponent },
  { path: 'signalements-list', component: SignalementsListeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
