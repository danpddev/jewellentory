# Software Requirements Specification (SRS)
## Project: Pricemerald
**Framework:** React Native (Expo)  
**UI Library:** Gluestack-UI  
**State Management:** Zustand + Local Storage Persistence  
**Internationalization:** i18n-js / react-i18next  

---

### 1. General Project Overview
The objective is to develop a standalone mobile application for jewelry estimation and quotation. The application must be cross-platform, highly performant, and completely functional offline during this initial phase. It must be structured modularly to support future real-time API integrations for market data.

### 2. Architectural & Technical Stack Requirements
- **Core Framework:** React Native via **Expo** (utilizing Expo Router for modern file-based navigation).
- **UI Architecture:** **Gluestack-UI** as the primary component and design token engine.
- **State Management:** **Zustand** for global client-side store management.
- **Persistence Layer:** Native local storage (e.g., `@react-native-async-storage/async-storage`) integrated into the Zustand store via middleware to preserve configuration values across application restarts.
- **Localization:** **i18n** suite setup supporting multi-language switching (English/Spanish base).
- **Design System & Theme:**
  - *Base Background:* Ultra-light muted gray/off-white (e.g., `#F8F9FA` or `#F4F5F6`).
  - *Secondary Accent 1:* Emerald Green (e.g., `#059669`).
  - *Secondary Accent 2:* Gold (e.g., `#d1b82a`).

---

### 3. Acceptance Criteria (Functional Requirements)

#### AC-1: UI & Component Architecture
- The application must be built using **Gluestack-UI** components as the exclusive framework for layout, inputs, forms, and feedback elements.
- The interface must adhere strictly to the defined color palette: an ultra-light gray background with refined emerald green and gold accents for highlights, buttons, and active states.

#### AC-2: Data Connectivity & Architectural Layering
- The application must function entirely locally without requiring an active internet connection or external API dependencies for this iteration.
- The data layer must implement an **Adapter Pattern** or dedicated repository abstraction. This structure will support a seamless future transition to fetch live Gold and Silver spot prices in real time.

#### AC-3: Navigation Structure
- The app must feature a bottom tab navigation menu (Inferior Navigation) displaying the two primary modules: **Cotizador** (Quotation Engine) and **Configuración de valores base** (Base Settings).
- The navigation bar or top header must include an easily accessible language selector toggle managed by the i18n configuration.

#### AC-4: Module 1 - Base Values Configuration (Configuración de Valores Base)
The module must render a robust, scrollable form layout to view and modify critical business rules, hourly costs, and material metrics. Inputs must update the global Zustand state instantly and persist locally.
The form must accept and manage:
- **Metals:** Gold (Oro), Silver (Plata).
- **Labor Rates:** Design Salary (Sueldo diseño), 3D Modeling Salary (Sueldo modelado 3D), Manual Labor/Polishing Salary (Sueldo trabajo manual - pulida).
- **Consumables:** Economy Resin Value (Valor resina económica), Premium Resin Value (Valor resina premium).
- **Finishes & Treatments:** Platinum Plating (Platinado), Rhodium Plating (Rodiado), Sandblasting Value (Valor arenado).
- **Setting Operations:** Normal Setting (Engaste normal), Complex Setting (Engaste complejo).
- **Gemstone Carat Pricing:** Default values for Diamonds (Diamantes), Emeralds (Esmeraldas), Rubies (Rubíes), Sapphires (Zafiros), Amethysts (Amatistas), Topazes (Topacios), and Citrines (Citrinos).
- **Extensibility:** Dynamic capability to append new custom stone definitions directly to the database system from the UI view.

#### AC-5: Module 2 - Quotation Engine (Cotizador)
The quotation interface must enable interactive inputs to generate a real-time price estimation for bespoke jewelry items based on the following dynamic criteria:
- **Jewelry Categorization:** Dropdown select or picker for piece type: Rings (Anillos), Earrings (Aretes), Bracelets (Pulseras), or Pendants (Dijes).
- **Metadata Fields:** Identification Name for the specific piece, Client Name.
- **Material Selection:** Dynamic selector for base Metal (Gold or Silver).
- **Gemstone Integration List:** An expandable layout section containing:
  - Dropdown menu to select a gemstone type (from the preconfigured list).
  - An adjacent input field to specify the approximate Carat weight (entered precisely in carat points).
- **Production Consumables:** Selection toggle or radio list for Resin Type (Economy or Premium).
- **Man Hours:** Input field indicating labor hours. By default, this field must pre-populate with the mathematical sum of the preconfigured *Design* and *Polishing* labor rates.
- **Stone Setting Selection:** Selection between Normal Setting or Complex Setting types.
- **Dynamic Setting Calculation:** Calculated readonly or automated indicator showing: $	ext{Setting Value} = 	ext{Total Quantity of Selected Stones} 	imes 	ext{Unit Cost of Selected Setting Type}$.
- **Finishing Toggles:**
  - Independent switch options to include/exclude Platinum Plating or Rhodium Plating.
  - An independent switch option to include/exclude Sandblasting (Arenado).
