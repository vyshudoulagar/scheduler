import React from "react";

import {
    render,
    cleanup,
    fireEvent,
    getByText,
    prettyDOM,
    findByText,
    getAllByTestId,
    getByAltText,
    getByPlaceholderText,
    queryByText,
    findByAltText
} from "@testing-library/react";

import Application from "components/Application";
import axios from "axios";

afterEach(cleanup);

describe("Appointment", () => {
    it("defaults to Monday and changes the schedule when a new day is selected", () => {
        const { queryByText, findByText } = render(<Application />);

        return findByText("Monday").then(() => {
            fireEvent.click(queryByText("Tuesday"));
            expect(queryByText("Leopold Silvers")).toBeInTheDocument();
        });
    });
});

describe("Application", () => {
    it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
        const { container, debug } = render(<Application />);

        await findByText(container, "Archie Cohen");

        const appointment = getAllByTestId(container, "appointment")[0];

        fireEvent.click(getByAltText(appointment, "Add"));

        fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
            target: { value: "Lydia Miller-Jones" }
        });
        fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

        fireEvent.click(getByText(appointment, "Save"));

        expect(getByText(appointment, "Saving")).toBeInTheDocument();

        await findByText(appointment, "Lydia Miller-Jones");

        const day = getAllByTestId(container, "day").find(day => queryByText(day, "Monday"));

        expect(getByText(day, "no spots remaining")).toBeInTheDocument();
    });

    it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
        const { container, debug } = render(<Application />);

        await findByText(container, "Archie Cohen");

        const appointment = getAllByTestId(container, "appointment").find(appointment =>
            queryByText(appointment, "Archie Cohen")
        );

        fireEvent.click(getByAltText(appointment, "Delete"));

        expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

        fireEvent.click(queryByText(appointment, "Confirm"));

        expect(getByText(appointment, "Deleting")).toBeInTheDocument();

        await findByAltText(appointment, "Add");

        const day = getAllByTestId(container, "day").find(day => queryByText(day, "Monday"));

        expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
    });

    it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
        const { container, debug } = render(<Application />);

        await findByText(container, "Archie Cohen");

        const appointment = getAllByTestId(container, "appointment").find(appointment =>
            queryByText(appointment, "Archie Cohen")
        );

        fireEvent.click(getByAltText(appointment, "Edit"));

        fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
            target: { value: "Lydia Miller-Jones" }
        });

        fireEvent.click(getByText(appointment, "Save"));

        const day = getAllByTestId(container, "day").find(day => queryByText(day, "Monday"));

        expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
    });

    it("shows the save error when failing to save an appointment", async () => {
        axios.put.mockRejectedValueOnce();

        const { container, debug } = render(<Application />);

        await findByText(container, "Archie Cohen");

        const appointment = getAllByTestId(container, "appointment").find(appointment =>
            queryByText(appointment, "Archie Cohen")
        );

        fireEvent.click(getByAltText(appointment, "Edit"));

        fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
            target: { value: "Lydia Miller-Jones" }
        });

        fireEvent.click(getByText(appointment, "Save"));

        await findByText(appointment, "Error");

        expect(getByText(appointment, "Could not book appointment.")).toBeInTheDocument();
    });

    it("shows the delete error when failing to delete an existing appointment", async () => {
        axios.delete.mockRejectedValueOnce();

        const { container, debug } = render(<Application />);

        await findByText(container, "Archie Cohen");

        const appointment = getAllByTestId(container, "appointment").find(appointment =>
            queryByText(appointment, "Archie Cohen")
        );

        fireEvent.click(getByAltText(appointment, "Delete"));

        fireEvent.click(queryByText(appointment, "Confirm"));

        await findByText(appointment, "Error");

        expect(getByText(appointment, "Could not cancel appointment.")).toBeInTheDocument();
    });
});

