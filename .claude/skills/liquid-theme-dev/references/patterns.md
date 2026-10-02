# Patterns for this theme

Adapt these; keep strings translated and CSS in `assets/`.

## Collection page with pagination and empty state

```liquid
{% block 'container' %}
  <h1>{{ collection.title }}</h1>

  {% paginate collection.products by 24 %}
    {% if collection.products.size > 0 %}
      <ul class="product-grid">
        {% for product in collection.products %}
          <li>{% render 'product-card', product: product %}</li>
        {% endfor %}
      </ul>
      {{ paginate | default_pagination }}
    {% else %}
      <p>{{ 'collections.empty' | t }}</p>
    {% endif %}
  {% endpaginate %}
{% endblock %}
```

## Product card snippet

```liquid
{% doc %}
  Product card for grids.

  @param {product} product - The product to render
  @param {string} [loading] - 'lazy' (default) or 'eager' for above-the-fold cards

  @example
  {% render 'product-card', product: product %}
{% enddoc %}

{%- assign image_loading = loading | default: 'lazy' -%}

<a class="product-card" href="{{ product.url }}">
  {% if product.featured_image %}
    {{ product.featured_image
      | image_url: width: 600
      | image_tag: widths: '300, 450, 600', sizes: '(min-width: 1100px) 25vw, 50vw', loading: image_loading }}
  {% endif %}
  <span class="product-card__title">{{ product.title }}</span>
  <span class="product-card__price">
    {% if product.compare_at_price > product.price %}
      <s>{{ product.compare_at_price | money }}</s>
    {% endif %}
    {{ product.price | money }}
  </span>
  {% unless product.available %}
    <span class="product-card__badge">{{ 'products.sold_out' | t }}</span>
  {% endunless %}
</a>
```

## Product form with sold-out handling

```liquid
{% form 'product', product %}
  {% assign current_variant = product.selected_or_first_available_variant %}
  <label for="variant-{{ product.id }}">{{ 'products.variant' | t }}</label>
  <select id="variant-{{ product.id }}" name="id">
    {% for variant in product.variants %}
      <option value="{{ variant.id }}" {% if variant == current_variant %}selected{% endif %} {% unless variant.available %}disabled{% endunless %}>
        {{ variant.title }} - {{ variant.price | money }}
      </option>
    {% endfor %}
  </select>

  <label for="quantity-{{ product.id }}">{{ 'products.quantity' | t }}</label>
  <input id="quantity-{{ product.id }}" type="number" name="quantity" min="1" value="1" inputmode="numeric">

  <button type="submit" {% unless current_variant.available %}disabled{% endunless %}>
    {% if current_variant.available %}{{ 'products.add_to_cart' | t }}{% else %}{{ 'products.sold_out' | t }}{% endif %}
  </button>
  {{ form | payment_button }}
{% endform %}
```

## Block with a single-property setting (CSS variable)

```liquid
<div class="promo" style="--promo-gap: {{ block.settings.gap }}px" {{ block.shopify_attributes }}>
  {{ content }}
</div>

{% schema %}
{
  "name": "t:general.promo",
  "settings": [
    { "type": "range", "id": "gap", "label": "t:labels.gap", "min": 0, "max": 80, "step": 4, "unit": "px", "default": 16 }
  ]
}
{% endschema %}
```

```css
/* assets/base.css */
.promo { display: grid; gap: var(--promo-gap); }
```

Add `general.promo` and `labels.gap` to `locales/en.default.schema.json`.

## Cart line items with empty state

```liquid
{% block 'container' %}
  <h1>{{ 'cart.title' | t }}</h1>
  {% if cart.item_count > 0 %}
    {% form 'cart', cart %}
      {% for item in cart.items %}
        <div class="cart-line">
          {% render 'image', image: item.image, class: 'cart-line__image' %}
          <a href="{{ item.url }}">{{ item.product.title }}</a>
          <input type="number" name="updates[]" value="{{ item.quantity }}" min="0" aria-label="{{ 'cart.quantity' | t }}">
          <span>{{ item.final_line_price | money }}</span>
        </div>
      {% endfor %}
      <button type="submit" name="update">{{ 'cart.update' | t }}</button>
      <button type="submit" name="checkout">{{ 'cart.checkout' | t }}</button>
    {% endform %}
  {% else %}
    <p>{{ 'cart.empty' | t }}</p>
  {% endif %}
{% endblock %}
```
