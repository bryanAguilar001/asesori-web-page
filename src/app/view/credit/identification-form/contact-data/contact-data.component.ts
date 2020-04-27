import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientService } from 'src/app/services/client/http-client.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { UserInfo } from 'src/app/models/user-info';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';

@Component({
  selector: 'app-contact-data',
  templateUrl: './contact-data.component.html',
  styleUrls: ['./contact-data.component.scss']
})
export class ContactDataComponent implements OnInit {

  constructor(
    private formbuilder: FormBuilder,
    private router: Router,
    private httpService: HttpClientService,
    private authenticationService: AuthenticationService,
  ) { }

  /**
   * Variables for the progress bar
   * @type {any[]}
  */
  public percentage: number = 0;

  /**
   * Variable to check user login
   * @type {any}
  */
  public user: any;

  /**
   * Variable to store the user id
   * @type {number}
  */
  public user_id: number;

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

  /**
   * Variables to retrieve user information
   * @type {boolean}
  */
  public hasEmail: boolean = false;
  public hasPhone1: boolean = false;

  /**
   * Define contact form
  */
  contactForm = this.formbuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(40)]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    phone2: ['', [Validators.required, Validators.minLength(10)]],
  });

  /**
   * Variable to verify if the contact form is correct
   * @type {boolean}
  */
  contactFormSubmitted: boolean;

  /**
   * Validate a form field
   * @param {string} field - Field of the form to be validated
   * @return {boolean} - True if the field is correct, false if it is not
  */
  isFieldValidContactForm(field: string) {
    return (
      this.contactForm.get(field).errors && this.contactForm.get(field).touched ||
      this.contactForm.get(field).untouched &&
      this.contactFormSubmitted && this.contactForm.get(field).errors
    );
  }

  /**
   * Validate contact form
   * @return {void} Nothing
  */
  onSubmitContactForm() {
    this.contactFormSubmitted = true;
    if (this.contactForm.valid) {
      let contact_data: any = {
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
        phone2: this.contactForm.value.phone2,
      }
      /** Store contact_data in localStorage*/
      localStorage.setItem('contact_data', JSON.stringify(contact_data));
      localStorage.setItem('percentage', this.percentage.toString());
      this.router.navigate(['credit/results/economic']);
    }
  }

  public personal_data: any;
  public location_data: any;
  public economic_data: any;
  public contact_data: any;
  public labor_data: any;
  public financial_data: any;

  ngOnInit() {
    window.scrollTo(0, 0);
    this.percentage = +localStorage.getItem('percentage');

    /* Handling of personal data when logging in */
    this.recuperateLoginData();
    this.authenticationService.subsVar = this.authenticationService.getUserData.subscribe(() => {
      this.recuperateLoginData();
    });
    this.authenticationService.subsClearVar = this.authenticationService.clearUserData.subscribe(() => {

      //this.contactForm.controls['email'].setValue("");
      this.contactForm.controls['phone'].setValue("");
      this.user_id = null;
      this.hasEmail = false;
      this.hasPhone1 = false;
      this.updatePercentageEmail();
      this.updatePercentagePhone();
    });

    /** Verificar contenido del local storage*/
    this.personal_data = JSON.parse(localStorage.getItem('personal_data'));
    this.location_data = JSON.parse(localStorage.getItem('location_data'));
    this.contact_data = JSON.parse(localStorage.getItem('contact_data'));
    this.economic_data = JSON.parse(localStorage.getItem('economic_data'));
    this.labor_data = JSON.parse(localStorage.getItem('labor_data'));
    this.financial_data = JSON.parse(localStorage.getItem('financial_data'));

    if(this.contact_data){
      this.contactForm.controls['phone'].setValue(this.contact_data.phone);
      this.contactForm.controls['phone2'].setValue(this.contact_data.phone2);
      this.contactForm.controls['email'].setValue(this.contact_data.email);
      this.percentagePhone = true;
      this.percentagePhone2 = true;
      this.percentageEmail = true;
    }else{
      this.contactForm.controls['email'].setValue(JSON.parse(localStorage.getItem('email_data')).email);
      this.percentageEmail = true;
      this.percentage += this.increase;
    }
  }

  /**------------------------------------------------METHODS AND FUNCTIONS FOR LOGIN---------------------------------------------------- */

  /**
   * Check if the user is logged in
   * @return {boolean} True if you are logged in, false if not
  */
  loginVerified(): boolean {
    let accessToken = localStorage.getItem('currentUser');
    if (accessToken) {
      this.user = JSON.parse(localStorage.getItem('currentUser'));
      return true;
    }
    this.user_id = null;
    return false;
  }

  /**
   * Retrieves the information if the user is logged in.
   * @return {void} Nothing
  */
  recuperateLoginData() {
    if (this.loginVerified()) {
      this.httpService.getDataUserlogin().subscribe((user: UserInfo) => {
        this.user_id = this.user.id;
        if (user) {
          if (user.email) {
            this.contactForm.controls['email'].setValue(user.email);
            this.hasEmail = true;
            this.updatePercentageEmail();
          }
          if (user.phone1) {
            this.contactForm.controls['phone'].setValue(user.phone1);
            this.hasPhone1 = true;
            this.updatePercentagePhone();
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  /**---------------------------------------------------------------------------------------------------------------------------------- */

  public percentageEmail: boolean = false;
  public percentagePhone: boolean = false;
  public percentagePhone2: boolean = false;

  public increase: number = 4;

  updatePercentagePhone(){
    if (this.contactForm.value.phone.length > 0 && !this.percentagePhone) {
      this.percentagePhone = true;
      this.percentage += this.increase;
    } else if (this.contactForm.value.phone.length == 0 && this.percentagePhone) {
      this.percentagePhone = false;
      this.percentage -= this.increase;
    }
  }

  updatePercentagePhone2(){
    if (this.contactForm.value.phone2.length > 0 && !this.percentagePhone2) {
      this.percentagePhone2 = true;
      this.percentage += this.increase;
    } else if (this.contactForm.value.phone2.length == 0 && this.percentagePhone2) {
      this.percentagePhone2 = false;
      this.percentage -= this.increase;
    }

  }

  updatePercentageEmail(){
    if (this.contactForm.value.email.length > 0 && !this.percentageEmail) {
      this.percentageEmail = true;
      this.percentage += this.increase;
    } else if (this.contactForm.value.email.length == 0 && this.percentageEmail) {
      this.percentageEmail = false;
      this.percentage -= this.increase;
    }
  }

}
