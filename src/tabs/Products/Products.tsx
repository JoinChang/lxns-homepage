import classes from './Products.module.scss'

import Button from "@/components/Button/Button.tsx"

import { ProductProps } from "@/data/products.tsx"

export default function Products({ products }: { products: ProductProps[] }) {
  const productElements = products.map((product, index) => {
    const linkElements = product.links.map((link, linkIndex) => {
      return (
        <div key={linkIndex} className={classes.productLinkItem}>
          <p>{link.name}</p>
          {link.href ? (
            <Button
              label={link.label}
              href={link.href}
              leftIcon={link.icon}
            />
          ) : (
            <div className={classes.productSearch}>
              {link.icon}
              {link.label}
            </div>
          )}
        </div>
      )
    })

    return (
      <div key={index} className={classes.productItem}>
        <img src={product.imageUrl} alt={product.title} referrerPolicy="no-referrer" loading="lazy" style={{
          maxHeight: 150,
        }}/>
        <div className={classes.productContent}>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <div className={classes.productLink}>
            {linkElements}
          </div>
        </div>
      </div>
    )
  })

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>
        衍生作品
      </h1>
      {productElements}
    </div>
  )
}
