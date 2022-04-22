import { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [stores, setStores] = useState([]);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [flags, setFlags] = useState([]);

  const loadStories = async () => {
    try {
      const res = await fetch("http://localhost:3000/stores");
      const body = await res.json();

      setStores(body.data);
      setBooks(body.included.filter((i) => i.type === "books"));
      setAuthors(body.included.filter((i) => i.type === "authors"));
      setCountries(body.included.filter((i) => i.type === "countries"));
    } catch (error) {
      console.log(error);
    }
  };

  const getFlag = async (country) => {
    try {
      if (flags.find((fl) => fl.cca2 === country)) {
        return;
      }

      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${country}`
      );
      const body = await res.json();
      return body[0];
    } catch (error) {
      console.log(error);
    }
  };

  const loadFlags = async () => {
    try {
      const res = await Promise.all(
        countries.map((country) => getFlag(country.attributes.code))
      );
      setFlags(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => void loadStories(), []);

  useEffect(() => void loadFlags(), [countries]);

  return (
    <main>
      {stores.length
        ? stores.map((store) => (
            <div key={store.id} className="storeBox">
              <div className="blockRow">
                <div id="bookStoreImageParent">
                  <img
                    src={store.attributes.storeImage}
                    alt="book store"
                    id="bookStoreImage"
                  />
                </div>
                <div id="blockMain">
                  <div>
                    <div id="storeName">{store.attributes.name}</div>
                    <div>
                      {new Array(store.attributes.rating)
                        .fill(0)
                        .map((i, index) => (
                          <span key={`${store.id}-start-${index}`}>
                            &#11088;
                          </span>
                        ))}
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Best-selling books</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store?.relationships?.books?.data?.length ? (
                        store?.relationships?.books?.data
                          ?.map((book) => books.find((b) => b.id === book.id))
                          ?.sort(
                            (a, b) =>
                              b?.attributes.copiesSold -
                              a?.attributes.copiesSold
                          )
                          ?.slice(0, 2)
                          ?.map((book, index) => {
                            const author = authors.find(
                              (a) =>
                                a.id === book?.relationships?.author?.data?.id
                            );

                            return (
                              <tr
                                key={`book-${book?.id || index}-author-${
                                  author?.id || index
                                }`}
                              >
                                <td>{book?.attributes?.name}</td>
                                <td>{author?.attributes?.fullName}</td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td>No data availiable</td>
                          <td></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="blockRow">
                <div>{`${store.attributes.establishmentDate
                  .slice(0, 10)
                  .split("-")
                  .reverse()
                  .join(".")} - ${store.attributes.website}`}</div>
                <img
                  className="flag"
                  src={
                    flags?.find(
                      (flag) =>
                        flag.cca2 ===
                        countries.find(
                          (c) => c.id === store.relationships.countries.data.id
                        )?.attributes?.code
                    )?.flags?.png
                  }
                  alt="flag"
                />
              </div>
            </div>
          ))
        : "No data availiable"}
    </main>
  );
};

export default App;
