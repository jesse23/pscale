# RFC 003 - [Done] Transform Pattern

|            |          |
| ---------- | -------- |
| _Creator_  | @jesse23 |
| _Reviewer_ |          |
| _Approval_ |          |
| _End Date_ |          |

## Background

Defines mapping rule pattern.

Given similar practice in spark, below is the example of a data mapping practice:

```scala
// Read CSV file into table
spark.read.option("header",true)
          .csv("/Users/admin/simple-zipcodes.csv")
          .createOrReplaceTempView("Zipcodes")

var df = spark.sql("SELECT country, city, zipcode, state FROM ZIPCODES")

// Or Read CSV file into table
val df = spark.read.option("header",true)
          .csv("/Users/admin/simple-zipcodes.csv")
df.printSchema()
df.show()

// DataFrame API Select query
df.select("country","city","zipcode","state")
     .show(5)

df.withColumn("Country", lit("USA"))
   .withColumn("anotherColumn",lit("anotherValue"))

//Write DataFrame data to CSV file (or output to other places)
df.write.csv("/tmp/spark_output/datacsv")

// for df joining, we cal either do df.join or use SQL as selector to a new DF
```

## Proposal

- If we don't consider outer join use case, for a given mapping, it must have a 1-1 mapping primary object from the source.
- So for a given data table, we would have:

```typescript
tarDF = transform(srcDF);
tarGraph["item"] = transform(srcGraph["product"]);
```

- So for given transform, we have:

```typescript
interface Transform {
  source: string;
  target: string;
  transform(src: DataFrame): DataFrame;
}
```

- The transform function should be independent to each other so that we can do parallel processing.
