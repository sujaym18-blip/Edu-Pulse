import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaStar,
  FaBullhorn,
  FaGraduationCap
} from "react-icons/fa";
import "../CSS/ViewAssFeed.css";

const ViewAssFeed = () => {
  const [feedback, setFeedback] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("Please login to view feedback");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:7000/viewassfeedback", {
          withCredentials: true,
        });

        setFeedback(res.data.feedback || []);
      } catch {
        setError("Unable to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="center error">{error}</p>;

  return (
    <div className="feedback-container">
      <h1 className="page-title">
        <FaGraduationCap /> Assignment Feedback
      </h1>

      {feedback.length === 0 ? (
        <p className="center">No feedback available</p>
      ) : (
        feedback.map((fb, index) => (
          <div className="accordion-card" key={fb._id}>
            <div
              className="accordion-header"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              <div>
                <FaBook /> Assignment ID: <strong>{fb.assignId}</strong>
              </div>

              <div className="marks-mini">
                <FaStar /> {fb.marks}
              </div>

              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {openIndex === index && (
              <div className="accordion-body">
                <p><strong>Student Name:</strong> {fb.stuName}</p>
                <p><strong>Email:</strong> {fb.stuEmail}</p>

                <div className="feedback-box">
                  <FaBullhorn /> <strong>Feedback</strong>
                  <p>{fb.feedback}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ViewAssFeed;
