import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientService } from 'src/app/services/client/http-client.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UserInfo } from 'src/app/models/user-info';

@Component({
  selector: 'app-location-data',
  templateUrl: './location-data.component.html',
  styleUrls: ['./location-data.component.scss']
})
export class LocationDataComponent implements OnInit {

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
  public percentage: number = 95;

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
  public hasAddress: boolean = false;

  /**
   * Location variables
   * @type {string}
  */
  public region_code: string;

  /**
    * Variable to store all provinces from Ecuador
    * @type {any}
   */
  public provinces: any;

  /**
   * Variable to store all cities from a province
   * @type {any}
  */
  public cities: any;

  /**
   * Define address form
  */
  addressForm = this.formbuilder.group({
    province: [null, [Validators.required]],
    address: ['', Validators.required],
    city: [null, [Validators.required]],
    reference: [''],
    sector: ['']
  });

  /**
   * Variable to verify if the address form is correct
   * @type {boolean}
  */
  addressFormSubmitted: boolean;

  /**
   * Validate a form field
   * @param {string} field - Field of the form to be validated
   * @return {boolean} - True if the field is correct, false if it is not
  */
  isFieldValidaddressForm(field: string) {
    return (
      this.addressForm.get(field).errors && this.addressForm.get(field).touched ||
      this.addressForm.get(field).untouched &&
      this.addressFormSubmitted && this.addressForm.get(field).errors
    );
  }

  /**
   * Validate address form
   * @return {void} Nothing
  */
  onSubmitaddressForm() {
    this.addressFormSubmitted = true;
    if (this.addressForm.valid) {
      let location_data: any = {
        city: this.addressForm.value.city,
        province: this.addressForm.value.province,
        address: this.addressForm.value.address,
        reference: this.addressForm.value.reference,
        sector: this.addressForm.value.sector
      }
      /** Store location_data in localStorage*/
      localStorage.setItem('location_data', JSON.stringify(location_data));
      this.router.navigate(['insurance/results/identification/contact']);
    }
  }

  public personal_data: any;
  public location_data: any;
  public contact_data: any;
  public vehicle_data:any;

  ngOnInit() {

    window.scrollTo(0, 0)

    /*  Get all provinces. */
    this.httpService.getProvinces().subscribe(res => {
      this.provinces = res.data;
    }, error => {
      console.log('error');
      console.log(error);
    });

    /*  Start - Search by location. */
    this.httpService.getCurrentLocation().subscribe(res => {
      this.httpService.verifyProvinceExistence(res.region_code).subscribe(resp => {

        /* In case the location is detected */
        if (resp.status === 200) {
          this.region_code = res.region_code;
          this.addressForm.controls['province'].setValue({ id: resp.data.id, name: resp.data.name });
          /* the cities of the detected province are loaded */
          this.httpService.getCities(resp.data.id).subscribe(res => {
            this.cities = []
            this.cities = res.data;
          }, error => {
            console.log('error');
            console.log(error);
          });
        }

        /* In case the location is not detected */
        if (resp.status === 500) {
          console.log(resp.message); // enviar como un mensaje de error
        }

      }, error => {
        console.log('error');
        console.log(error);
      });
    }, error => {
      console.log('error');
      console.log(error);
    });
    /*  End - Search by location. */

    /* Handling of personal data when logging in */
    this.recuperateLoginData();
    this.authenticationService.subsVar = this.authenticationService.getUserData.subscribe(() => {
      this.recuperateLoginData();
    });
    this.authenticationService.subsClearVar = this.authenticationService.clearUserData.subscribe(() => {
      this.addressForm.controls['address'].setValue("");
      this.user_id = null;
      this.hasAddress = false;
    });

    /** Verificar contenido del local storage*/
    this.personal_data = JSON.parse(localStorage.getItem('personal_data'));
    this.location_data = JSON.parse(localStorage.getItem('location_data'));
    this.contact_data = JSON.parse(localStorage.getItem('contact_data'));
    this.vehicle_data = JSON.parse(localStorage.getItem('vehicle_data'));

    if (this.location_data) {
      this.addressForm.controls['city'].setValue({ id: this.location_data.city.id, name: this.location_data.city.name });
      this.addressForm.controls['province'].setValue({ id: this.location_data.province.id, name: this.location_data.province.name });
      this.addressForm.controls['address'].setValue(this.location_data.address);
      this.addressForm.controls['reference'].setValue(this.location_data.reference);
      this.addressForm.controls['sector'].setValue(this.location_data.sector);
    }
  }

  /**
   * Recover the cities of a province
   * @param {Event} event.id - Province identifier
   * @return {void} Nothing
  */
  changeProvince(event) {
    this.httpService.getCities(event.id).subscribe(res => {
      this.addressForm.controls['city'].setValue(null);
      this.cities = []
      this.cities = res.data;
    }, error => {
      console.log('error');
      console.log(error);
    });
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
          if (user.address) {
            this.addressForm.controls['address'].setValue(user.address);
            this.hasAddress = true;
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

}
