# Application Guidelines

This document outlines the standards and conventions to be followed for Angular application development to ensure consistency, maintainability, and scalability.

---

## **1. Folder Structure**

### **1.1 General Folder Structure**
Organize the application into core, shared, and feature-specific modules.

```plaintext
src/
|
├── app/
│   ├── core/               // Singleton services, interceptors, guards, app-level utilities
│   │   ├── services/       // Global services
│   │   ├── interceptors/   // HTTP interceptors
│   │   ├── guards/         // Route guards
│   │   └── core.module.ts  // Core module definition
│   │
│   ├── shared/             // Reusable components, directives, and pipes
│   │   ├── components/     // Shared UI components
│   │   ├── directives/     // Reusable directives
│   │   ├── pipes/          // Reusable pipes
│   │   └── shared.module.ts
│   │
│   ├── features/           // Feature modules (see structure below)
│   │
│   ├── assets/             // Static assets like images, fonts, etc.
│   ├── environments/       // Environment-specific configurations
│   └── app.module.ts       // Root module
|
├── styles/                 // Global SCSS or CSS styles
├── index.html              // Entry point for the app
└── main.ts                 // Bootstrapping file
```

### **1.2 Feature Module Structure**
Each feature module should be self-contained and follow this structure:

```plaintext
features/feature-name
  ├── pages
  │   ├── page-one
  │   │   ├── page-one.component.ts
  │   │   ├── page-one.component.html
  │   │   └── page-one.component.scss
  │   └── page-two
  │       ├── page-two.component.ts
  │       ├── page-two.component.html
  │       └── page-two.component.scss
  ├── components
  │   ├── shared
  │   │   ├── shared-component-one
  │   │   │   ├── shared-component-one.component.ts
  │   │   │   ├── shared-component-one.component.html
  │   │   │   └── shared-component-one.component.scss
  │   │   └── shared-component-two
  │   │       ├── shared-component-two.component.ts
  │   │       ├── shared-component-two.component.html
  │   │       └── shared-component-two.component.scss
  │   └── page-one-components
  │       ├── specific-component-one
  │       │   ├── specific-component-one.component.ts
  │       │   ├── specific-component-one.component.html
  │       │   └── specific-component-one.component.scss
  │       └── specific-component-two
  │           ├── specific-component-two.component.ts
  │           ├── specific-component-two.component.html
  │           └── specific-component-two.component.scss
  ├── services
  │   ├── feature-name-api.service.ts
  │   └── feature-name-facade.service.ts
  └── feature-name.module.ts
```

---

## **2. Service Patterns**
Use the **Facade Pattern** by default unless unnecessary. A feature module typically consists of the following services:

### **2.1 Facade Service**
- The **facade service** serves as the single entry point for the UI layer to interact with the feature's logic.
- Handles interaction with the state and API services.

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureFacadeService {
  constructor(private apiService: FeatureApiService) {}

  getData(): Observable<Data[]> {
    return this.apiService.getData();
  }
}
```

### **2.2 API Service**
- Handles HTTP requests specific to the feature.

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureApiService {
  constructor(private http: HttpClient) {}

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>(`/api/feature`);
  }
}
```

---

## **3. Naming Conventions**

### **3.1 File Naming**
- Use **kebab-case** for file names.

Examples:
```plaintext
user-profile.component.ts
user-profile.module.ts
user-api.service.ts
```

### **3.2 Class Names**
- Use **PascalCase** for class names.
Examples:
```typescript
export class ServicesList {}
export class UserProfileComponent {}
export class UserApiService {}
```

### **3.3 variables and methods**
- Use camelCase `firstName`.
- prefix private and protected members with `_`.
- for booleans use prefixes like `is`, `has`.
Example:
```typescript
private _apiUrl = 'https://api.example.com';
isLoggedIn: boolean = true;
```

- for event handler methods use prefixes like `on`.
Example:
```typescript
onClick(): void{
    // Handle click event logic
}
onFormSubmit(): void {
    // Handle submit event logic
}
```

### **3.4 Constants**
- All uppercase with underscores `MAX_ITEMS`, `API_URL`.

## **3.5 EventEmitter**
- CamelCase `factoriesSelected`.

## **3.6 HTML Classes**
- Follow the BEM methodology. You can learn more about it here: https://getbem.com/

---

## **4. No Magic Numbers**
- Avoid using hardcoded values in the code. Use constants or configuration files instead.

### **Example:**
```typescript
// Avoid
setTimeout(() => console.log('Done'), 1000);

// Use constants
const TIMEOUT_DELAY = 1000;
setTimeout(() => console.log('Done'), TIMEOUT_DELAY);
```

### **Define Constants:**
Use a dedicated file for constants:
```typescript
export const FEATURE_CONSTANTS = {
  TIMEOUT_DELAY: 1000,
  API_RETRY_COUNT: 3,
};
```

---

## **5. Best Practices**

### **5.1 Reusable Components**
- Place reusable components in the `shared/components` directory.
- Ensure components are generic and configurable via `@Input` and `@Output` properties.

### **5.2 Avoid Logic in Templates**
- Minimize logic in the HTML template to improve readability.

### **5.3 Unsubscribe from Observables**
- Always unsubscribe from subscriptions in `OnDestroy` to avoid memory leaks.

Example:
```typescript
private subscription: Subscription;

ngOnInit(): void {
  this.subscription = this.featureService.getData().subscribe();
}

ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
```

---
