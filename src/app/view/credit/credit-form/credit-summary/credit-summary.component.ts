import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-credit-summary',
  templateUrl: './credit-summary.component.html',
  styleUrls: ['./credit-summary.component.scss']
})
export class CreditSummaryComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  /**
   * Carousel options
   * @type {OwlOptions}
  */
  public customOptions: OwlOptions = {
    loop: true,
    freeDrag: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    responsive: {
      0: {
        items: 2
      },
      400: {
        items: 4
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    }
  }

  ngOnInit() {
    window.scrollTo(0, 0)
  }

  onSubmitSummary() {
    this.router.navigate(['credit/finalize']);
  }

}
