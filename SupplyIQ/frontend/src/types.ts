export type Kpis={inventory_value:number;fill_rate:number;at_risk_products:number;open_alerts:number;supplier_otd:number;forecast_accuracy:number;inventory_delta:number;fill_rate_delta:number}
export type Alert={id:number;severity:string;alert_type:string;title:string;message:string;entity:string;recommendation:string;created_at:string;status:string}
export type CriticalProduct={id:number;sku:string;name:string;stock:number;reorder_point:number;risk_score:number;supplier:string;days_cover:number}
export type Supplier={id:number;name:string;region:string;on_time_rate:number;defect_rate:number;lead_days:number;risk_score:number;status:string}
export type Dashboard={kpis:Kpis;inventory_health:{name:string;value:number;color:string}[];risk_distribution:{name:string;value:number;color:string}[];demand_trend:{date:string;actual:number;forecast:number}[];category_inventory:{name:string;value:number}[];critical_products:CriticalProduct[];supplier_performance:Supplier[];alerts:Alert[]}
