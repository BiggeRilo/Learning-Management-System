import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIcon],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state__icon" [attr.aria-hidden]="true">{{ icon() }}</mat-icon>
      <h3 class="empty-state__title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty-state__message">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 48px 24px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);

      &__icon {
        width: 64px;
        height: 64px;
        font-size: 64px;
        opacity: 0.4;
      }

      &__title {
        margin: 0;
        font: var(--mat-sys-title-medium);
      }

      &__message {
        margin: 0;
        max-width: 420px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input('Nada por aqui');
  readonly message = input('');
}
