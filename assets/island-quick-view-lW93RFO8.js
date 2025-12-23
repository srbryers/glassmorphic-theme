var h=Object.defineProperty;var v=(d,l,t)=>l in d?h(d,l,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[l]=t;var c=(d,l,t)=>v(d,typeof l!="symbol"?l+"":l,t);import{c as m}from"./island-cart-drawer-BXBOsEp0.js";class b extends HTMLElement{constructor(){super(...arguments);c(this,"modal",null);c(this,"backdrop",null);c(this,"content",null);c(this,"closeButton",null);c(this,"productData",null);c(this,"selectedVariant",null);c(this,"quantity",1);c(this,"previousFocus",null);c(this,"handleKeydown",t=>{t.key==="Escape"&&this.isOpen()&&this.close()})}connectedCallback(){console.log("[Island] quick-view hydrated (client:idle)"),this.modal=this.querySelector("[data-modal]"),this.backdrop=this.querySelector("[data-backdrop]"),this.content=this.querySelector("[data-content]"),this.closeButton=this.querySelector("[data-close]"),this.setupEventListeners(),this.listenForTriggers()}disconnectedCallback(){document.removeEventListener("keydown",this.handleKeydown)}setupEventListeners(){var t,e;(t=this.closeButton)==null||t.addEventListener("click",()=>this.close()),(e=this.backdrop)==null||e.addEventListener("click",()=>this.close()),document.addEventListener("keydown",this.handleKeydown)}listenForTriggers(){document.addEventListener("quick-view:open",(t=>{const{productHandle:e}=t.detail;e&&this.open(e)}))}isOpen(){var t;return((t=this.modal)==null?void 0:t.classList.contains("open"))??!1}async open(t){var e;if(!(!this.modal||!this.content)){this.previousFocus=document.activeElement,this.modal.classList.add("open"),this.modal.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden",this.content.innerHTML=this.renderLoading();try{const i=await fetch(`/products/${t}.json`);if(!i.ok)throw new Error("Failed to fetch product");const n=await i.json();this.productData=n.product,this.selectedVariant=((e=this.productData)==null?void 0:e.variants[0])||null,this.quantity=1,this.content.innerHTML=this.renderProduct(),this.setupProductInteractions();const o=this.content.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');o==null||o.focus()}catch(i){console.error("Quick view error:",i),this.content.innerHTML=this.renderError()}}}close(){var t;this.modal&&(this.modal.classList.remove("open"),this.modal.setAttribute("aria-hidden","true"),document.body.style.overflow="",(t=this.previousFocus)==null||t.focus(),this.dispatchEvent(new CustomEvent("quick-view:closed",{bubbles:!0})))}renderLoading(){return`
      <div class="quick-view__loading">
        <div class="quick-view__spinner"></div>
        <p>Loading product...</p>
      </div>
    `}renderError(){return`
      <div class="quick-view__error">
        <svg class="w-12 h-12 text-[var(--destructive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="mt-4 text-lg font-medium">Failed to load product</p>
        <button type="button" class="btn btn-secondary mt-4" data-close>Close</button>
      </div>
    `}renderProduct(){if(!this.productData)return"";const t=this.productData,e=this.selectedVariant,i=t.images[0]||"",n=t.variants.length>1;return`
      <div class="quick-view__grid">
        <!-- Image -->
        <div class="quick-view__image">
          <img
            src="${i}"
            alt="${t.title}"
            class="w-full h-full object-cover rounded-xl"
            data-main-image
          />
        </div>

        <!-- Details -->
        <div class="quick-view__details">
          <h2 class="text-2xl font-bold mb-2">${t.title}</h2>

          ${t.vendor?`<p class="text-sm text-[var(--muted-foreground)] mb-4">${t.vendor}</p>`:""}

          <!-- Price -->
          <div class="quick-view__price mb-6" data-price>
            ${this.renderPrice(e)}
          </div>

          <!-- Options -->
          ${n?this.renderOptions():""}

          <!-- Quantity -->
          <div class="quick-view__quantity mb-6">
            <label class="block text-sm font-medium mb-2">Quantity</label>
            <div class="quantity-selector">
              <button type="button" class="quantity-selector__button" data-decrease aria-label="Decrease quantity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <input
                type="number"
                class="quantity-selector__input"
                value="${this.quantity}"
                min="1"
                max="99"
                data-quantity
                aria-label="Quantity"
              />
              <button type="button" class="quantity-selector__button" data-increase aria-label="Increase quantity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Add to Cart -->
          <button
            type="button"
            class="btn btn-primary w-full mb-4"
            data-add-to-cart
            ${e!=null&&e.available?"":"disabled"}
          >
            ${e!=null&&e.available?"Add to Cart":"Sold Out"}
          </button>

          <!-- View Full Details -->
          <a
            href="/products/${t.handle}"
            class="btn btn-secondary w-full"
          >
            View Full Details
          </a>

          <!-- Description -->
          ${t.description?`
            <div class="quick-view__description mt-6 pt-6 border-t border-[var(--border)]">
              <p class="text-sm text-[var(--muted-foreground)] line-clamp-4">${t.description}</p>
            </div>
          `:""}
        </div>
      </div>
    `}renderPrice(t){if(!t)return"";const e=this.formatMoney(t.price),i=t.compare_at_price?this.formatMoney(t.compare_at_price):null;return i&&t.compare_at_price>t.price?`
        <span class="text-2xl font-bold text-[var(--destructive)]">${e}</span>
        <span class="text-lg text-[var(--muted-foreground)] line-through ml-2">${i}</span>
      `:`<span class="text-2xl font-bold">${e}</span>`}renderOptions(){return this.productData?this.productData.options.map((t,e)=>{var o;const i=`option${e+1}`,n=((o=this.selectedVariant)==null?void 0:o[i])||t.values[0];return`
        <div class="quick-view__option mb-4">
          <label class="block text-sm font-medium mb-2">${t.name}</label>
          <div class="flex flex-wrap gap-2" data-option="${t.name}">
            ${t.values.map(a=>{const s=a===n,r=this.isOptionAvailable(t.name,a);return`
                <button
                  type="button"
                  class="quick-view__option-button ${s?"selected":""} ${r?"":"unavailable"}"
                  data-option-value="${a}"
                  data-option-name="${t.name}"
                  ${r?"":"disabled"}
                  aria-pressed="${s}"
                >
                  ${a}
                </button>
              `}).join("")}
          </div>
        </div>
      `}).join(""):""}isOptionAvailable(t,e){if(!this.productData)return!1;const n=`option${this.productData.options.findIndex(o=>o.name===t)+1}`;return this.productData.variants.some(o=>o[n]===e&&o.available)}setupProductInteractions(){var o;if(!this.content)return;this.content.querySelectorAll("[data-option-value]").forEach(a=>{a.addEventListener("click",()=>{const s=a.dataset.optionName,r=a.dataset.optionValue;s&&r&&this.selectOption(s,r)})});const t=this.content.querySelector("[data-decrease]"),e=this.content.querySelector("[data-increase]"),i=this.content.querySelector("[data-quantity]");t==null||t.addEventListener("click",()=>{this.quantity>1&&(this.quantity--,i&&(i.value=String(this.quantity)))}),e==null||e.addEventListener("click",()=>{this.quantity<99&&(this.quantity++,i&&(i.value=String(this.quantity)))}),i==null||i.addEventListener("change",()=>{const a=parseInt(i.value,10);a>=1&&a<=99?this.quantity=a:i.value=String(this.quantity)});const n=this.content.querySelector("[data-add-to-cart]");n==null||n.addEventListener("click",()=>this.addToCart()),(o=this.content.querySelector("[data-close]"))==null||o.addEventListener("click",()=>this.close())}selectOption(t,e){var a;if(!this.productData||!this.content)return;const i=this.content.querySelector(`[data-option="${t}"]`);i==null||i.querySelectorAll("[data-option-value]").forEach(s=>{const r=s.getAttribute("data-option-value")===e;s.classList.toggle("selected",r),s.setAttribute("aria-pressed",String(r))}),this.productData.options.findIndex(s=>s.name===t);const n={};this.productData.options.forEach((s,r)=>{var p;const u=`option${r+1}`;s.name===t?n[u]=e:n[u]=((p=this.selectedVariant)==null?void 0:p[u])||s.values[0]});const o=this.productData.variants.find(s=>(!n.option1||s.option1===n.option1)&&(!n.option2||s.option2===n.option2)&&(!n.option3||s.option3===n.option3));if(o){this.selectedVariant=o;const s=this.content.querySelector("[data-price]");s&&(s.innerHTML=this.renderPrice(o));const r=this.content.querySelector("[data-add-to-cart]");if(r&&(r.disabled=!o.available,r.textContent=o.available?"Add to Cart":"Sold Out"),(a=o.featured_image)!=null&&a.src){const u=this.content.querySelector("[data-main-image]");u&&(u.src=o.featured_image.src)}}}async addToCart(){var i;if(!((i=this.selectedVariant)!=null&&i.available)||!this.content)return;const t=this.content.querySelector("[data-add-to-cart]");if(!t)return;const e=t.textContent;t.disabled=!0,t.innerHTML=`
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Adding...
    `;try{await m.addItem(this.selectedVariant.id,this.quantity),t.innerHTML=`
        <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Added!
      `,document.dispatchEvent(new CustomEvent("cart:open")),setTimeout(()=>this.close(),1e3)}catch(n){console.error("Add to cart error:",n),t.textContent="Error - Try Again",t.disabled=!1,setTimeout(()=>{t&&(t.textContent=e)},2e3)}}formatMoney(t){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(t/100)}}customElements.define("quick-view",b);export{b as QuickView};
