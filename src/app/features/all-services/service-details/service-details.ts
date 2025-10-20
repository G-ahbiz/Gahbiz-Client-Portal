import { Component, OnInit } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { Breadcrumb } from 'primeng/breadcrumb';

export interface Service {
  id: number;
  title: string;
  description: string;
  orignalPrice: string;
  priceOffer: string;
  images: string[];
  serviceList: string;
  rating: number;
  ratingsCount: number;
}

@Component({
  selector: 'app-service-details',
  imports: [Navbar, Footer, Breadcrumb],
  templateUrl: './service-details.html',
  styleUrl: './service-details.scss'
})
export class ServiceDetails implements OnInit {


  ngOnInit() { }

}
