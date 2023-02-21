import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AjouterSignalementComponent } from './components/ajouter-signalement/ajouter-signalement.component';
import { ModifierSignalementComponent } from './components/modifier-signalement/modifier-signalement.component';
import { SignalementsListeComponent } from './components/signalement-liste/signalements-liste.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ajouter-signalement' },
  { path: 'ajouter-signalement', component: AjouterSignalementComponent },
  { path: 'modifier-signalement/:id', component: ModifierSignalementComponent },
  { path: 'signalements-liste', component: SignalementsListeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
