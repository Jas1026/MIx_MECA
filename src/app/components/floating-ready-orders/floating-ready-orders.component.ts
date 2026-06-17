import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerContentService } from 'src/app/services/server-content.service';

@Component({
selector:'app-floating-ready-orders',

templateUrl:'./floating-ready-orders.component.html',

styleUrls:[
'./floating-ready-orders.component.scss'
]

})
export class FloatingReadyOrdersComponent
implements OnInit,OnDestroy{

expanded=false;

orders:any[]=[];

interval:any;

constructor(

private server:ServerContentService

){}

ngOnInit(){

this.load();

this.interval=setInterval(()=>{

this.load();

},2000);

}

ngOnDestroy(){

clearInterval(this.interval);

}

toggle(){

this.expanded=!this.expanded;

}

load(){

this.server

.getReadyOrders()

.subscribe((res:any)=>{

if(res.error==0){

this.orders=res.data;

}

});

}

}