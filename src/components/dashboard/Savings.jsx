import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../utils/Modal";
import Button from "../utils/Button";
import { InlineLoader } from "../utils/Loader";
import { fetchUserDetails } from "../../services/slices/userSlice";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import NoRecords from "../utils/NoRecords";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { addSavings } from "../../services/slices/savings/addSavingsSlice";
import { fetchSavingsDetails, setCurrentPage } from "../../services/slices/savings/getUserSavings";


const Savings = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const { loading, error, success } = useSelector((state) => state.addSavings);
  const { userSavingsDetails, currentPage, savingsPerPage,  totalSavings } =
    useSelector((state) => state.getUserSavings);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [savingsData, setSavingsData] = useState({
    userId: "",
    amount: "",
    description: "",
    date: "",
    category: "",
  });

  const totalPages = Math.ceil(totalSavings / savingsPerPage);
  const startIndex = (currentPage - 1) * savingsPerPage + 1;
  const endIndex = Math.min(currentPage * savingsPerPage, totalSavings);
  const date = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  const placeholderRows = Array.from(
    { length: 10 - (userSavingsDetails ? userSavingsDetails.length : 0) },
    (_, index) => (
      <tr key={`placeholder-${index}`} className="colored-table">
        <td className="w-[35%]">&nbsp;</td>
        <td className="w-[20%]">&nbsp;</td>
        <td className="w-[20%]">&nbsp;</td>
        <td className="w-[25%]">&nbsp;</td>
        {/* <td className="cursor-pointer">
        <HiOutlineDotsVertical className="invisible" />
      </td> */}
      </tr>
    )
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addSavings(savingsData));
    dispatch(fetchUserDetails(auth.user._id));
    window.location.reload();
  };
  const downloadPDF = () => {
    const input = document.getElementById("pdf-table");

    const userDetailsDiv = document.getElementById("user-details");
    userDetailsDiv.style.display = "flex";

    // const downloadButton = document.getElementById('download-button');
    // downloadButton.style.display = 'none'

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Savings_Statement.pdf");
    });
  };

  useEffect(() => {
    if (auth.user && auth.user._id) {
      setSavingsData((prevState) => ({ ...prevState, userId: auth.user._id }));
      dispatch(
        fetchSavingsDetails({
          userId: auth.user._id,
          page: currentPage,
          savingsPerPage: savingsPerPage,
        })
      );
      dispatch(fetchUserDetails(auth.user._id));
    }
  }, [dispatch, currentPage, savingsPerPage, auth.user]);

  useEffect(() => {
    if (success) {
      setModalIsOpen(false);
      setSavingsData({
        userId: auth.user ? auth.user._id : "",
        amount: "",
        description: "",
        date: "",
        category: "",
      });
      dispatch(resetSuccess());
    }
  }, [success, auth.user, dispatch]);

  return (
    <main>
      <div className="mt-6">
        <div className=" h-52 shadow bg-white  px-4 mx-4">
          <div className="flex h-full justify-between items-center">
            <div>
              <h1 className="text-4xl mb-2 font-semibold">Savings</h1>
              <p>Add Saving and track your statement</p>
            </div>

            <button
              onClick={() => setModalIsOpen(true)}
              className="border-2 flex flex-col bg-[008000] justify-center items-center px-5 py-3 rounded-[3px] bg-main text-white border-main font-semibold cursor-pointer"
            >
              + Add Savings
            </button>
          </div>

          <Modal
            isOpen={modalIsOpen}
            isClose={() => setModalIsOpen(false)}
            title="Add Savings"
          >
            <form onSubmit={handleSubmit} className="flex flex-col">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                name="amount"
                id="amount"
                required
                value={savingsData.amount}
                onChange={(e) =>
                  setSavingsData({ ...savingsData, amount: e.target.value })
                }
                placeholder="Enter the amount"
                className="border-2 rounded-[3px] p-2 mt-[3px] border-main outline-none"
              />

              <label className="mt-4" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={savingsData.date}
                onChange={(e) =>
                  setSavingsData({ ...savingsData, date: e.target.value })
                }
                placeholder="Enter the date"
                className="border-2 placeholder:text-gray-400 rounded-[3px] p-2 mt-[3px] border-main outline-none"
              />
              <label className="mt-4" htmlFor="category">
                Category
              </label>
              <input
                type="text"
                name="category"
                id="category"
                required
                value={savingsData.category}
                onChange={(e) =>
                  setSavingsData({ ...savingsData, category: e.target.value })
                }
                placeholder="Enter category"
                className="border-2 rounded-[3px] p-2 mt-[3px] border-main outline-none "
              />
              <label className="mt-4" htmlFor="description">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={savingsData.description}
                onChange={(e) =>
                  setSavingsData({
                    ...savingsData,
                    description: e.target.value,
                  })
                }
                className="border-2 rounded-[3px] p-2 mt-[3px] border-main outline-none mb-4"
                placeholder="Enter description"
              ></textarea>
              <Button
                text={loading ? <InlineLoader /> : "Add"}
                type="submit"
                specific="filled_button"
              />
            </form>
          </Modal>
        </div>

        {/* TABLE */}
        <section>
          {totalSavings === 0 ? (
            <NoRecords />
          ) : (
            <div>
              <div
                className="overflow-x-auto mx-4 p-4 shadow bg-white pb-3 mt-10"
                id="pdf-table"
              >
                <div
                  id="user-details"
                  className="hidden mb-2 items-center justify-between"
                  // className="flex items-center justify-between mb-2 "
                >
                  <h4 className="text-2xl font-semibold">Savings Statment</h4>
                  <div className=" tex">
                    <h4 className="capitalize">
                      {user.userDetails.firstName} {user.userDetails.lastName}
                    </h4>
                    <p>{user.userDetails.email}</p>
                    <p>
                      {user.userDetails.occupation}, {user.userDetails.location}
                    </p>
                  </div>
                </div>

                <table className="w-full">
                  <thead className="bg-main w-full text-white">
                    <tr>
                      <th className="w-[35%]">Description</th>
                      <th className="w-[20%]">Amount</th>
                      <th className="w-[20%]">Date</th>
                      <th className="w-[25%]">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSavingsDetails &&
                      userSavingsDetails.map((item, index) => (
                        <tr key={index} className="colored-table">
                          <td className="first-letter:capitalize">
                            {item.description}
                          </td>
                          <td>{item.amount}</td>
                          <td>{date(item.date)}</td>
                          <td className=" first-letter:capitalize">
                            {item.category}
                          </td>
                        </tr>
                      ))}

                    {placeholderRows}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-2">
                  <p>
                    Showing {startIndex} to {endIndex} of {totalSavings}{" "}
                    entries
                  </p>
                  <div id="download-button">
                    <Button
                      text="Download as PDF"
                      specific="short-filled"
                      onClick={downloadPDF}
                    />
                  </div>

                  <div className=" flex space-x-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={`text-gray-600 hover:text-main ${
                        currentPage <= 1 ? "opacity-85 cursor-not-allowed" : ""
                      }`}
                    >
                      <HiOutlineChevronLeft className="text-3xl font-extrabold" />
                    </button>
                    {/* {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`text-gray-600 hover:text-gray-900 ${currentPage === index + 1 ? 'bg-green-400' : ''}`}
                      >
                        {index + 1}
                      </button>
                    ))} */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`text-gray-600 hover:text-gray-900 ${
                        currentPage >= totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <HiOutlineChevronRight className=" text-3xl font-extrabold" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Savings;
