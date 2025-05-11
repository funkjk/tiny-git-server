CREATE TABLE IF NOT EXISTS files
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    filepath text NOT NULL,
    file_type character varying(256) NOT NULL,
    ctime timestamp without time zone NOT NULL DEFAULT now(),
    mtime timestamp without time zone NOT NULL,
    file_size integer,
    data bytea,
    repository_id character varying(256) ,
    UNIQUE (filepath)
);
