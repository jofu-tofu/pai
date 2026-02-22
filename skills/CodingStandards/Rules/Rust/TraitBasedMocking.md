### RS8.4 TraitBasedMocking

**Impact: HIGH (Traits decouple business logic from external dependencies, enabling fast isolated tests)**

Design components against trait interfaces rather than concrete types so that tests can substitute mocks, fakes, or stubs. Use `mockall` for auto-generated mocks when hand-written fakes are too verbose. This prevents tests from requiring network access, databases, or file systems.

**Incorrect: Business logic hardcoded to a concrete HTTP client**

```rust
use reqwest::Client;

pub struct OrderService {
    client: Client,  // concrete type -- tests must hit the network
}

impl OrderService {
    pub async fn get_price(&self, item_id: &str) -> Result<f64, Error> {
        let resp = self.client
            .get(format!("https://api.example.com/items/{item_id}"))
            .send()
            .await?;
        let data: PriceResponse = resp.json().await?;
        Ok(data.price)
    }
}

// Tests require a running API server or complex HTTP mocking
```

**Correct: Trait interface with mockall for testing**

```rust
#[cfg_attr(test, mockall::automock)]
pub trait PriceFetcher {
    async fn fetch_price(&self, item_id: &str) -> Result<f64, Error>;
}

pub struct OrderService<P: PriceFetcher> {
    price_fetcher: P,
}

impl<P: PriceFetcher> OrderService<P> {
    pub async fn get_price(&self, item_id: &str) -> Result<f64, Error> {
        self.price_fetcher.fetch_price(item_id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn returns_fetched_price() {
        let mut mock = MockPriceFetcher::new();
        mock.expect_fetch_price()
            .with(mockall::predicate::eq("widget"))
            .returning(|_| Ok(9.99));

        let service = OrderService { price_fetcher: mock };
        assert_eq!(service.get_price("widget").await.unwrap(), 9.99);
    }
}
```

**When acceptable:**
- Small binaries where the concrete dependency is trivial to construct (e.g., an in-memory `HashMap`)
- When a hand-written fake is simpler and more readable than a mock framework
- Performance-sensitive paths where trait object or generic overhead is measurable
