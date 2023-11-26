# RFC 002 - [Done] Core Data Model

## Background

Defines core data model

## Proposal

For any bulk transform data, it must be formulated to a table or JSONL pattern, aggregated by types. For example:

```json
{
  "product": [
    {
      "id": "id1",
      "name": "product 1",
      "owner": "id3"
    },
    {
      "id": "id2",
      "name": "product 2",
      "owner": "id4"
    }
  ],
  "user": [
    {
      "id": "id3",
      "name": "owner 1"
    },
    {
      "id": "id4",
      "name": "owner 2"
    }
  ]
}
```

For the outcome, it would be expected as a same pattern, for example:

```json
{
  "item": [
    {
      "id": "id1",
      "internal_name": "product 1",
      "owned_by": "owner 1"
    },
    {
      "id": "id1",
      "internal_name": "product 2",
      "owned_by": "owner 2"
    }
  ]
}
```

If we use SQL to transform, it will be something like:

```sql
-- spark.sql(SQL_BELOW).write.saveAsTable("item")
-- marge to one table
SELECT product.name AS internal_name, user.name AS owned_by FROM product, user WHERE product.owner = user.id and product.type = "my_type"
```

# Reference

https://sparkbyexamples.com/spark/spark-dataframe-withcolumn/

https://github.com/dumbmatter/csv-sql-live
