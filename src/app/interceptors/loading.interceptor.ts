// interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '@services/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  let totalRequests = 0;

  totalRequests++;
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      totalRequests--;
      if (totalRequests === 0) {
        loadingService.hide();
      }
    })
  );
};